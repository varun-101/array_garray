import User from "../models/User.js";
import Issue from "../models/Issue.js";
import PullRequest from "../models/PullRequest.js";

class DatabaseService {
  
  // User operations
  static async createOrUpdateUser(githubUser, accessToken) {
    try {
      const userData = {
        githubId: githubUser.id,
        username: githubUser.login,
        email: githubUser.email || null,
        name: githubUser.name || null,
        avatar: githubUser.avatar_url || null,
        githubUrl: githubUser.html_url || null,
        accessToken: accessToken,
        lastLoginAt: new Date()
      };

      const user = await User.findOneAndUpdate(
        { githubId: githubUser.id },
        userData,
        { 
          upsert: true, 
          new: true, 
          setDefaultsOnInsert: true 
        }
      );

      return user;
    } catch (error) {
      throw new Error(`Failed to create/update user: ${error.message}`);
    }
  }

  static async findUserByGitHubId(githubId) {
    try {
      return await User.findByGitHubId(githubId);
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  static async findUserByUsername(username) {
    try {
      return await User.findByUsername(username);
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  static async updateUserAccessToken(githubId, accessToken) {
    try {
      return await User.findOneAndUpdate(
        { githubId },
        { 
          accessToken,
          lastLoginAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to update access token: ${error.message}`);
    }
  }

  static async updateUserRepositories(githubId, repositories) {
    try {
      const user = await User.findByGitHubId(githubId);
      if (!user) {
        throw new Error('User not found');
      }

      // Clear existing repositories and add new ones
      user.repositories = repositories.map(repo => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        private: repo.private,
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        language: repo.language || '',
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        lastUpdated: new Date(repo.updated_at)
      }));

      user.stats.totalRepos = repositories.length;
      await user.save();

      return user;
    } catch (error) {
      throw new Error(`Failed to update repositories: ${error.message}`);
    }
  }

  // Issue operations
  static async createOrUpdateIssue(githubIssue, repository, isCreatedByApp = false) {
    try {
      const issueData = {
        githubIssueId: githubIssue.id,
        repository: {
          owner: repository.owner,
          name: repository.name,
          fullName: repository.fullName
        },
        title: githubIssue.title,
        body: githubIssue.body || '',
        state: githubIssue.state,
        labels: githubIssue.labels || [],
        assignees: githubIssue.assignees || [],
        author: {
          githubId: githubIssue.user.id,
          username: githubIssue.user.login,
          name: githubIssue.user.name || githubIssue.user.login,
          avatar: githubIssue.user.avatar_url
        },
        githubUrl: githubIssue.html_url,
        createdAt: new Date(githubIssue.created_at),
        updatedAt: new Date(githubIssue.updated_at),
        closedAt: githubIssue.closed_at ? new Date(githubIssue.closed_at) : null,
        comments: githubIssue.comments || 0,
        reactions: githubIssue.reactions || {},
        milestone: githubIssue.milestone || null,
        isCreatedByApp,
        appMetadata: {
          createdVia: 'api',
          sessionId: null,
          userAgent: null
        }
      };

      const issue = await Issue.findOneAndUpdate(
        { githubIssueId: githubIssue.id },
        issueData,
        { 
          upsert: true, 
          new: true, 
          setDefaultsOnInsert: true 
        }
      );

      return issue;
    } catch (error) {
      throw new Error(`Failed to create/update issue: ${error.message}`);
    }
  }

  static async findIssuesByRepository(owner, repoName) {
    try {
      return await Issue.findByRepository(owner, repoName);
    } catch (error) {
      throw new Error(`Failed to find issues: ${error.message}`);
    }
  }

  static async findIssuesByAuthor(githubId) {
    try {
      return await Issue.findByAuthor(githubId);
    } catch (error) {
      throw new Error(`Failed to find issues: ${error.message}`);
    }
  }

  // Pull Request operations
  static async createOrUpdatePullRequest(githubPR, repository, isCreatedByApp = false) {
    try {
      const prData = {
        githubPrId: githubPR.id,
        repository: {
          owner: repository.owner,
          name: repository.name,
          fullName: repository.fullName
        },
        title: githubPR.title,
        body: githubPR.body || '',
        state: githubPR.state,
        draft: githubPR.draft || false,
        head: {
          ref: githubPR.head.ref,
          sha: githubPR.head.sha,
          user: {
            githubId: githubPR.head.user.id,
            username: githubPR.head.user.login,
            name: githubPR.head.user.name || githubPR.head.user.login,
            avatar: githubPR.head.user.avatar_url
          }
        },
        base: {
          ref: githubPR.base.ref,
          sha: githubPR.base.sha,
          user: {
            githubId: githubPR.base.user.id,
            username: githubPR.base.user.login,
            name: githubPR.base.user.name || githubPR.base.user.login,
            avatar: githubPR.base.user.avatar_url
          }
        },
        author: {
          githubId: githubPR.user.id,
          username: githubPR.user.login,
          name: githubPR.user.name || githubPR.user.login,
          avatar: githubPR.user.avatar_url
        },
        assignees: githubPR.assignees || [],
        reviewers: githubPR.requested_reviewers || [],
        labels: githubPR.labels || [],
        githubUrl: githubPR.html_url,
        diffUrl: githubPR.diff_url,
        patchUrl: githubPR.patch_url,
        createdAt: new Date(githubPR.created_at),
        updatedAt: new Date(githubPR.updated_at),
        closedAt: githubPR.closed_at ? new Date(githubPR.closed_at) : null,
        mergedAt: githubPR.merged_at ? new Date(githubPR.merged_at) : null,
        mergeCommitSha: githubPR.merge_commit_sha || null,
        mergeable: githubPR.mergeable,
        mergeableState: githubPR.mergeable_state,
        comments: githubPR.comments || 0,
        reviewComments: githubPR.review_comments || 0,
        commits: githubPR.commits || 0,
        additions: githubPR.additions || 0,
        deletions: githubPR.deletions || 0,
        changedFiles: githubPR.changed_files || 0,
        reactions: githubPR.reactions || {},
        milestone: githubPR.milestone || null,
        isCreatedByApp,
        appMetadata: {
          createdVia: 'api',
          sessionId: null,
          userAgent: null
        }
      };

      const pullRequest = await PullRequest.findOneAndUpdate(
        { githubPrId: githubPR.id },
        prData,
        { 
          upsert: true, 
          new: true, 
          setDefaultsOnInsert: true 
        }
      );

      return pullRequest;
    } catch (error) {
      throw new Error(`Failed to create/update pull request: ${error.message}`);
    }
  }

  static async findPullRequestsByRepository(owner, repoName) {
    try {
      return await PullRequest.findByRepository(owner, repoName);
    } catch (error) {
      throw new Error(`Failed to find pull requests: ${error.message}`);
    }
  }

  static async findPullRequestsByAuthor(githubId) {
    try {
      return await PullRequest.findByAuthor(githubId);
    } catch (error) {
      throw new Error(`Failed to find pull requests: ${error.message}`);
    }
  }

  // Statistics operations
  static async getUserStats(githubId) {
    try {
      const user = await User.findByGitHubId(githubId);
      if (!user) {
        throw new Error('User not found');
      }

      const issueCount = await Issue.countDocuments({ 'author.githubId': githubId });
      const prCount = await PullRequest.countDocuments({ 'author.githubId': githubId });

      // Update user stats
      user.stats.totalIssues = issueCount;
      user.stats.totalPullRequests = prCount;
      await user.save();

      return {
        totalRepos: user.stats.totalRepos,
        totalIssues: issueCount,
        totalPullRequests: prCount,
        lastLoginAt: user.lastLoginAt
      };
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }

  // Cleanup operations
  static async cleanupExpiredTokens() {
    try {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 30); // 30 days ago

      const result = await User.updateMany(
        { 
          lastLoginAt: { $lt: expiredDate },
          isActive: true 
        },
        { 
          isActive: false 
        }
      );

      return result;
    } catch (error) {
      throw new Error(`Failed to cleanup expired tokens: ${error.message}`);
    }
  }
}

export default DatabaseService;
