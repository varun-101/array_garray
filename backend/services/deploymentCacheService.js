import Implementation from '../models/Implementation.js';

class DeploymentCacheService {
  constructor() {
    this.cache = new Map(); // In-memory cache for quick lookups
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout
  }

  /**
   * Generate a cache key for deployment lookup
   */
  generateCacheKey(repoUrl, branchName, projectName) {
    return `${repoUrl}:${branchName}:${projectName}`.toLowerCase();
  }

  /**
   * Check if deployment already exists in database
   */
  async findExistingDeployment(repoUrl, branchName, projectName) {
    try {
      const cacheKey = this.generateCacheKey(repoUrl, branchName, projectName);
      
      // Check in-memory cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log(`Deployment cache hit for: ${cacheKey}`);
          return cached.deployment;
        } else {
          this.cache.delete(cacheKey);
        }
      }

      // Check database for existing deployment
      const existingDeployment = await Implementation.findOne({
        repoUrl: repoUrl,
        'deployment.branchName': branchName,
        'deployment.success': true,
        'deployment.url': { $exists: true, $ne: null }
      }).sort({ 'deployment.deployedAt': -1 });

      if (existingDeployment && existingDeployment.deployment) {
        console.log(`Found existing deployment in database for: ${cacheKey}`);
        
        // Cache the result
        this.cache.set(cacheKey, {
          deployment: existingDeployment.deployment,
          timestamp: Date.now()
        });

        return existingDeployment.deployment;
      }

      console.log(`No existing deployment found for: ${cacheKey}`);
      return null;
    } catch (error) {
      console.error('Error checking existing deployment:', error);
      return null;
    }
  }

  /**
   * Store deployment result in cache and database
   */
  async cacheDeploymentResult(repoUrl, branchName, projectName, deploymentData, implementationId) {
    try {
      const cacheKey = this.generateCacheKey(repoUrl, branchName, projectName);
      
      // Store in in-memory cache
      this.cache.set(cacheKey, {
        deployment: deploymentData,
        timestamp: Date.now()
      });

      // Update the implementation record in database
      if (implementationId) {
        const implementation = await Implementation.findOne({
          implementationId: implementationId
        });

        if (implementation) {
          await implementation.updateDeployment(deploymentData);
          console.log(`Cached deployment result for implementation: ${implementationId}`);
        }
      }

      console.log(`Deployment cached successfully for: ${cacheKey}`);
      return true;
    } catch (error) {
      console.error('Error caching deployment result:', error);
      return false;
    }
  }

  /**
   * Get deployment status for a specific implementation
   */
  async getDeploymentStatus(implementationId) {
    try {
      const implementation = await Implementation.findOne({
        implementationId: implementationId
      });

      if (implementation && implementation.deployment) {
        return {
          success: implementation.deployment.success,
          url: implementation.deployment.url,
          status: implementation.deployment.status,
          branchName: implementation.deployment.branchName,
          deployedAt: implementation.deployment.deployedAt
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting deployment status:', error);
      return null;
    }
  }

  /**
   * Check if branch is already deployed
   */
  async isBranchDeployed(repoUrl, branchName) {
    try {
      const existingDeployment = await Implementation.findOne({
        repoUrl: repoUrl,
        'deployment.branchName': branchName,
        'deployment.success': true
      });

      return existingDeployment ? existingDeployment.deployment : null;
    } catch (error) {
      console.error('Error checking if branch is deployed:', error);
      return null;
    }
  }

  /**
   * Get all deployments for a repository
   */
  async getRepositoryDeployments(repoUrl, limit = 10) {
    try {
      const deployments = await Implementation.find({
        repoUrl: repoUrl,
        'deployment.success': true
      })
      .sort({ 'deployment.deployedAt': -1 })
      .limit(limit)
      .select('implementationId title deployment createdAt');

      return deployments.map(impl => ({
        implementationId: impl.implementationId,
        title: impl.title,
        deployment: impl.deployment,
        createdAt: impl.createdAt
      }));
    } catch (error) {
      console.error('Error getting repository deployments:', error);
      return [];
    }
  }

  /**
   * Clear cache for a specific deployment
   */
  clearDeploymentCache(repoUrl, branchName, projectName) {
    const cacheKey = this.generateCacheKey(repoUrl, branchName, projectName);
    this.cache.delete(cacheKey);
    console.log(`Cleared deployment cache for: ${cacheKey}`);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
    console.log('Cleared all deployment cache');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timeout: this.cacheTimeout
    };
  }
}

export default new DeploymentCacheService();
