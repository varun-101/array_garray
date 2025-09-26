import axios from "axios";

class GitHubService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = "https://api.github.com";
    this.headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Codeissance-Hackathon-App"
    };
  }

  // Get user's repositories
  async getUserRepos() {
    try {
      const response = await axios.get(`${this.baseURL}/user/repos`, {
        headers: this.headers,
        params: {
          sort: "updated",
          per_page: 100
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch repositories: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get a specific repository
  async getRepo(owner, repo) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch repository: ${error.response?.data?.message || error.message}`);
    }
  }

  // Create an issue
  async createIssue(owner, repo, issueData) {
    try {
      const response = await axios.post(`${this.baseURL}/repos/${owner}/${repo}/issues`, {
        title: issueData.title,
        body: issueData.body,
        labels: issueData.labels || [],
        assignees: issueData.assignees || []
      }, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create issue: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get issues for a repository
  async getIssues(owner, repo, options = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/issues`, {
        headers: this.headers,
        params: {
          state: options.state || "open",
          sort: options.sort || "created",
          direction: options.direction || "desc",
          per_page: options.per_page || 30
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch issues: ${error.response?.data?.message || error.message}`);
    }
  }

  // Create a pull request
  async createPullRequest(owner, repo, prData) {
    try {
      const response = await axios.post(`${this.baseURL}/repos/${owner}/${repo}/pulls`, {
        title: prData.title,
        body: prData.body,
        head: prData.head, // source branch
        base: prData.base, // target branch
        draft: prData.draft || false
      }, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create pull request: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get pull requests for a repository
  async getPullRequests(owner, repo, options = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/pulls`, {
        headers: this.headers,
        params: {
          state: options.state || "open",
          sort: options.sort || "created",
          direction: options.direction || "desc",
          per_page: options.per_page || 30
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch pull requests: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get repository branches
  async getBranches(owner, repo) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/branches`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch branches: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get repository commits
  async getCommits(owner, repo, options = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/commits`, {
        headers: this.headers,
        params: {
          sha: options.sha || "main",
          per_page: options.per_page || 30
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch commits: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get a specific issue
  async getIssue(owner, repo, issueNumber) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/issues/${issueNumber}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch issue: ${error.response?.data?.message || error.message}`);
    }
  }

  // Update an issue
  async updateIssue(owner, repo, issueNumber, issueData) {
    try {
      const response = await axios.patch(`${this.baseURL}/repos/${owner}/${repo}/issues/${issueNumber}`, {
        title: issueData.title,
        body: issueData.body,
        state: issueData.state,
        labels: issueData.labels,
        assignees: issueData.assignees
      }, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update issue: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get a specific pull request
  async getPullRequest(owner, repo, prNumber) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/pulls/${prNumber}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch pull request: ${error.response?.data?.message || error.message}`);
    }
  }

  // Update a pull request
  async updatePullRequest(owner, repo, prNumber, prData) {
    try {
      const response = await axios.patch(`${this.baseURL}/repos/${owner}/${repo}/pulls/${prNumber}`, {
        title: prData.title,
        body: prData.body,
        state: prData.state,
        base: prData.base
      }, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update pull request: ${error.response?.data?.message || error.message}`);
    }
  }

  // Merge a pull request
  async mergePullRequest(owner, repo, prNumber, mergeData) {
    try {
      const response = await axios.put(`${this.baseURL}/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
        commit_title: mergeData.commit_title,
        commit_message: mergeData.commit_message,
        merge_method: mergeData.merge_method || "merge"
      }, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to merge pull request: ${error.response?.data?.message || error.message}`);
    }
  }

  // Check if user has access to repository
  async checkRepoAccess(owner, repo) {
    try {
      await this.getRepo(owner, repo);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
}

export default GitHubService;
