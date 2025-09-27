import fetch from "node-fetch";

const deployToVercelController = async (req, res) => {
  try {
    const { name, repoId, branch = "main", projectId, implementationId } = req.body;
    
    if (!name || !repoId) {
      return res.status(400).json({ 
        error: "Name and repoId are required" 
      });
    }

    console.log(`Deploying to Vercel: ${name} from branch ${branch}`);
    
    const response = await fetch("https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        gitSource: {
          type: "github",
          repoId: repoId, // This is the actual GitHub repository ID from the database
          ref: branch, // Use the provided branch name
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Vercel deployment failed:', data);
      return res.status(500).json({ 
        error: "Failed to deploy to Vercel",
        details: data.error?.message || data.message || `HTTP ${response.status}: ${response.statusText}`
      });
    }

    if (data.error) {
      console.error('Vercel deployment error in response:', data.error);
      return res.status(500).json({
        error: "Failed to deploy to Vercel",
        details: data.error.message || 'Deployment failed'
      });
    }

    // Extract the deployment URL from various possible response formats
    let deploymentUrl = data.url || data.deploymentUrl || data.deployment?.url || data.deployment?.deploymentUrl;
    
    // Ensure the URL has a protocol
    if (deploymentUrl && !deploymentUrl.startsWith('http')) {
      deploymentUrl = `https://${deploymentUrl}`;
    }

    console.log(`Vercel deployment successful: ${deploymentUrl}`);
    
    return res.status(201).json({
      success: true,
      deploymentUrl: deploymentUrl,
      deploymentId: data.id,
      branch: branch,
      projectId: projectId,
      implementationId: implementationId
    });
  } catch (err) {
    console.error('Vercel deployment error:', err);
    return res.status(500).json({ 
      error: "Failed to deploy to Vercel",
      details: err.message 
    });
  }
};

// New function to deploy implementation branch
export const deployImplementationBranch = async (req, res) => {
  try {
    const { 
      repoId, // This should be the actual GitHub repository ID from the database
      branchName, 
      projectName, 
      implementationId,
      projectId 
    } = req.body;

    if (!repoId || !branchName || !projectName) {
      return res.status(400).json({
        error: "Repository ID, branch name, and project name are required"
      });
    }
    
    // Create deployment name with implementation ID
    const deploymentName = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${implementationId}`;

    console.log(`Deploying implementation branch: ${branchName} for ${deploymentName}`);

    const response = await fetch("https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: deploymentName,
        gitSource: {
          type: "github",
          repoId: repoId, // This is the actual GitHub repository ID from the database
          ref: branchName,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Vercel deployment failed:', data);
      return res.status(500).json({
        success: false,
        error: "Failed to deploy implementation branch",
        details: data.error?.message || data.message || `HTTP ${response.status}: ${response.statusText}`
      });
    }

    if (data.error) {
      console.error('Vercel deployment error in response:', data.error);
      return res.status(500).json({
        success: false,
        error: "Failed to deploy implementation branch",
        details: data.error.message || 'Deployment failed'
      });
    }

    // Extract the deployment URL from various possible response formats
    let deploymentUrl = data.url || data.deploymentUrl || data.deployment?.url || data.deployment?.deploymentUrl;
    
    // Ensure the URL has a protocol
    if (deploymentUrl && !deploymentUrl.startsWith('http')) {
      deploymentUrl = `https://${deploymentUrl}`;
    }

    console.log(`Implementation deployment successful: ${deploymentUrl}`);

    return res.status(201).json({
      success: true,
      deploymentUrl: deploymentUrl,
      deploymentId: data.id,
      branchName: branchName,
      projectName: projectName,
      implementationId: implementationId,
      projectId: projectId,
      repoId: repoId
    });

  } catch (err) {
    console.error('Implementation deployment error:', err);
    return res.status(500).json({
      success: false,
      error: "Failed to deploy implementation branch",
      details: err.message
    });
  }
};

export default deployToVercelController;
