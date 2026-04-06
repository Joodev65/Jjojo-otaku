const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Joodev65';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Jjojo-otaku';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const githubApi = axios.create({
  baseURL: `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`,
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Jjojo-Otaku-App'
  }
});

class GitHubSync {
  constructor() {
    this.cache = new Map();
  }

  async getFile(path) {
    try {
      const response = await githubApi.get(`/contents/${path}`, {
        params: { ref: GITHUB_BRANCH }
      });
      
      const content = Buffer.from(response.data.content, 'base64').toString('utf8');
      return {
        content: JSON.parse(content),
        sha: response.data.sha
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { content: {}, sha: null };
      }
      throw error;
    }
  }

  async updateFile(path, content, sha, message = 'Update data') {
    const contentString = JSON.stringify(content, null, 2);
    const contentBase64 = Buffer.from(contentString).toString('base64');

    const data = {
      message,
      content: contentBase64,
      branch: GITHUB_BRANCH
    };

    if (sha) {
      data.sha = sha;
    }

    const response = await githubApi.put(`/contents/${path}`, data);
    return response.data;
  }

  async getUsers() {
    const result = await this.getFile('data/users.json');
    return result.content.users || [];
  }

  async saveUsers(users) {
    const result = await this.getFile('data/users.json');
    await this.updateFile(
      'data/users.json',
      { users, updatedAt: new Date().toISOString() },
      result.sha,
      'Update users data'
    );
  }

  async getWatchHistory() {
    const result = await this.getFile('data/watch-history.json');
    return result.content.history || {};
  }

  async saveWatchHistory(history) {
    const result = await this.getFile('data/watch-history.json');
    await this.updateFile(
      'data/watch-history.json',
      { history, updatedAt: new Date().toISOString() },
      result.sha,
      'Update watch history'
    );
  }

  async getProgress() {
    const result = await this.getFile('data/progress.json');
    return result.content.progress || {};
  }

  async saveProgress(progress) {
    const result = await this.getFile('data/progress.json');
    await this.updateFile(
      'data/progress.json',
      { progress, updatedAt: new Date().toISOString() },
      result.sha,
      'Update watch progress'
    );
  }
}

module.exports = new GitHubSync();