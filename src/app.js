import { initStatusPanel } from './modules/status.js'
import { initStatisticsPanel } from './modules/statistics.js'
import { initClientsPanel } from './modules/clients.js'
import { initFiltersPanel } from './modules/filters.js'
import { testConnection, updateConfig, getConfig } from './modules/api.js'

// Global variables for refresh timers
let refreshInterval = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
  // Create the user interface
  const app = document.getElementById('app')
  app.innerHTML = `
<div class="container-fluid">
      <div class="page-header">
        <h2>AdGuard Home Control</h2>
        <div class="btn-group">
          <button class="btn btn-default" id="refresh-all">
            <span class="fa fa-refresh"></span> Refresh All
          </button>
          <button class="btn btn-info" id="toggle-auto-refresh">
            <span class="fa fa-clock-o"></span> Auto Refresh: OFF
          </button>
        </div>
      </div>

      <div id="message-container" style="display: none" class="alert">
        <span id="message-text"></span>
        <button
          type="button"
          class="close"
          onclick="document.getElementById('message-container').style.display='none'"
        >
          <span>&times;</span>
        </button>
      </div>

      <!-- Configuration Panel -->
      <div class="panel panel-default">
        <div class="panel-heading">
          <h3 class="panel-title">Configuration API</h3>
        </div>
        <div class="panel-body">
          <div class="form-group">
            <label for="api-url">URL API:</label>
            <input
              type="text"
              class="form-control"
              id="api-url"
              value="http://localhost:3000"
            />
          </div>
          <div class="form-group">
            <label for="api-username">Username:</label>
            <input
              type="text"
              class="form-control"
              id="api-username"
              value="username"
            />
          </div>
          <div class="form-group">
            <label for="api-password">Password:</label>
            <input
              type="password"
              class="form-control"
              id="api-password"
              value="password"
            />
          </div>
          <button id="test-connection" class="btn btn-primary">
            Connection Test
          </button>
          <button id="save-config" class="btn btn-success">
            Save Configuration
          </button>
          <div id="connection-result" style="margin-top: 15px"></div>
        </div>
      </div>

      <!-- Status Panel -->
      <div class="panel panel-default" id="status-panel">
        <div class="panel-heading">
          <h3 class="panel-title">Status</h3>
        </div>
        <div class="panel-body">
          <div class="row">
            <div class="col-md-6">
              <p>
                <strong>Protection: </strong>
                <span id="protection-status">Loading...</span>
              </p>
              <p>
                <strong>DNS listening:</strong>
                <span id="dns-addresses">Loading...</span>
              </p>
            </div>
            <div class="col-md-6 text-right">
              <button id="toggle-protection" class="btn btn-danger">
                Protection OFF
              </button>
              <button id="refresh-status" class="btn btn-default">
                Refresh<span class="fa fa-refresh"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Panel -->
      <div class="panel panel-default" id="statistics-panel">
        <div class="panel-heading">
          <h3 class="panel-title">Statistics</h3>
        </div>
        <div class="panel-body">
          <div class="stats-vertical">
            <div class="stat-item">
              <h4 id="dns-queries">0</h4>
              <p>DNS Queries</p>
            </div>
            <div class="stat-item">
              <h4 id="blocked-queries">0</h4>
              <p>Blocked</p>
            </div>
            <div class="stat-item">
              <h4 id="blocked-percentage">0%</h4>
              <p>Blocked Percentage</p>
            </div>
          </div>

          <div class="recent-queries-header">
            <h4>Recent Queries</h4>
            <button id="refresh-stats" class="btn btn-default">
              <span class="fa fa-refresh"></span> Refresh
            </button>
          </div>
          <div class="table-responsive">
            <table class="table table-condensed centered-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Domain</th>
                  <th>Type</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody id="query-log-body">
                <tr>
                  <td colspan="4" style="text-align: center;">Loading...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Filters Panel -->
      <div class="panel panel-default" id="filters-panel">
        <div class="panel-heading">
          <h3 class="panel-title">Filters</h3>
        </div>
        <div class="panel-body">
          <div class="filters-header">
            <h4>Active Filters</h4>
            <div>
              <button id="refresh-filters" class="btn btn-default">
                <span class="fa fa-refresh"></span> Refresh
              </button>
              <button id="update-filters" class="btn btn-primary">
                <span class="fa fa-download"></span> Update All
              </button>
            </div>
          </div>
          <div class="list-group" id="filters-list">
            <div class="list-group-item">Loading...</div>
          </div>
        </div>
      </div>

      <!-- Clients Panel -->
      <div class="panel panel-default" id="clients-panel">
        <div class="panel-heading">
          <h3 class="panel-title">Connected Clients</h3>
        </div>
        <div class="panel-body">
          <div id="dhcp-status"></div>
          <div class="list-group" id="clients-list">
            <div class="list-group-item">Loading...</div>
          </div>
          <div class="text-right" style="margin-top: 10px">
            <button id="refresh-clients" class="btn btn-default">
              <span class="fa fa-refresh"></span>Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
`;

  // Inizialization of panels
  const statusPanel = initStatusPanel()
  const statisticsPanel = initStatisticsPanel()
  const clientsPanel = initClientsPanel()
  const filtersPanel = initFiltersPanel()

  // Load saved configuration and populate form
  const savedConfig = getConfig();
  document.getElementById('api-url').value = savedConfig.baseUrl;
  document.getElementById('api-username').value = savedConfig.username;
  document.getElementById('api-password').value = savedConfig.password;

  statusPanel.init()
  statisticsPanel.init()
  clientsPanel.init()
  filtersPanel.init()

  // Configure the global refresh button
  document.getElementById('refresh-all').addEventListener('click', function () {
    statusPanel.loadData()
    statisticsPanel.loadData()
    clientsPanel.loadData()
    filtersPanel.loadData()
  })

  // Configure the auto-refresh button
  const autoRefreshBtn = document.getElementById('toggle-auto-refresh');
  let autoRefreshEnabled = false;

  autoRefreshBtn.addEventListener('click', function () {
    autoRefreshEnabled = !autoRefreshEnabled;

    if (autoRefreshEnabled) {
      // Enable auto-refresh every 10 seconds
      refreshInterval = setInterval(() => {
        statusPanel.loadData()
        statisticsPanel.loadData()
        clientsPanel.loadData()
        filtersPanel.loadData()
      }, 10000);

      autoRefreshBtn.innerHTML =
        '<span class="fa fa-clock-o"></span> Auto Refresh: ON';
      autoRefreshBtn.className = 'btn btn-success';
      window.showMessage("Auto refresh enabled", "success");
    } else {
      // Disable auto-refresh
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }

      autoRefreshBtn.innerHTML =
        '<span class="fa fa-clock-o"></span> Auto refresh: OFF';
      autoRefreshBtn.className = 'btn btn-info';
      window.showMessage("Auto refresh disabled", "info");
    }
  });

  // Configure the test connection button
  document.getElementById('test-connection').addEventListener('click', async function () {
    const resultDiv = document.getElementById('connection-result');
    resultDiv.className = 'alert alert-info';
    resultDiv.innerHTML = 'Testing connection...';

    const testConfig = {
      baseUrl: document.getElementById('api-url').value,
      username: document.getElementById('api-username').value,
      password: document.getElementById('api-password').value
    };

    try {
      const result = await testConnection(testConfig);
      if (result.success) {
        resultDiv.className = 'alert alert-success';
        resultDiv.innerHTML = `Connection successful! Version: ${result.version}`;
      } else {
        resultDiv.className = 'alert alert-danger';
        resultDiv.innerHTML = `Error: ${result.message}`;
      }
    } catch (error) {
      resultDiv.className = 'alert alert-danger';
      resultDiv.innerHTML = `Error: ${error.message}`;
    }
  });

  // Configure the save configuration button
  document.getElementById('save-config').addEventListener('click', function () {
    const newConfig = {
      baseUrl: document.getElementById('api-url').value,
      username: document.getElementById('api-username').value,
      password: document.getElementById('api-password').value
    };

    updateConfig(newConfig);

    const resultDiv = document.getElementById('connection-result');
    resultDiv.className = 'alert alert-success';
    resultDiv.innerHTML = 'Configuration saved successfully!';

    // Test the connection automatically after saving
    setTimeout(() => {
      document.getElementById('test-connection').click();
    }, 1000);
  });

  // Function to show messages
  window.showMessage = function (message, type = 'info') {
    const container = document.getElementById('message-container')
    const text = document.getElementById('message-text')

    container.className = `alert alert-${type}`
    text.textContent = message
    container.style.display = 'block'

    // Automatically hide after 5 seconds
    setTimeout(() => {
      container.style.display = 'none'
    }, 5000)
  }

  // Pulizia quando la pagina viene chiusa
  window.addEventListener('beforeunload', function () {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
})