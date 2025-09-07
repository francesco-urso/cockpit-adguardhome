import { getClients, getDhcpInfo } from './api.js'

// Clients Panel
export function initClientsPanel() {
    return {
        element: document.getElementById("clients-panel"),
        refreshBtn: document.getElementById("refresh-clients"),
        clientsList: document.getElementById("clients-list"),

        async init() {
            this.refreshBtn.addEventListener("click", () => this.loadData());
            await this.loadData();
        },

        async loadData() {
            try {
                this.setLoading(true);
                const [clients, dhcpInfo] = await Promise.all([
                    getClients(),
                    getDhcpInfo(),
                ]);
                this.updateUI(clients, dhcpInfo);
            } catch (error) {
                this.showError(error.message);
            } finally {
                this.setLoading(false);
            }
        },

        // Update the UI with the list of clients and DHCP info
        updateUI(clients, dhcpInfo) {
            this.clientsList.innerHTML = "";

            if (clients && clients.length > 0) {
                clients.forEach((client) => {
                    const item = document.createElement("div");
                    item.className = "list-group-item";
                    item.innerHTML = `
            <div class="row">
              <div class="col-md-6">
                <strong>${client.name || "Unknown device"}</strong>
                <p>${client.ip} • ${client.mac || "MAC unavailable"}</p>
              </div>
              <div class="col-md-6 text-right">
                <span class="badge">${client.source || "Static"}</span>
              </div>
            </div>
          `;
                    this.clientsList.appendChild(item);
                });
            } else {
                this.clientsList.innerHTML =
                    '<div class="list-group-item">No clients found.</div>';
            }

            this.updateDhcpInfo(dhcpInfo);
        },

        // Update the DHCP info section
        updateDhcpInfo(dhcpInfo) {
            const dhcpStatus = document.getElementById("dhcp-status");
            if (dhcpInfo && dhcpInfo.enabled) {
                dhcpStatus.innerHTML = `
          <p><strong>DHCP:</strong> <span class="text-success">ENABLED</span></p>
          <p><strong>IP Range:</strong> ${dhcpInfo.range_start} - ${dhcpInfo.range_end}</p>
          <p><strong>Lease Duration:</strong> ${dhcpInfo.lease_duration} hours</p>
        `;
            } else {
                dhcpStatus.innerHTML =
                    '<p><strong>DHCP:</strong> <span class="text-danger">DISABLE</span></p>';
            }
        },

        // Set the loading state of the refresh button
        setLoading(loading) {
            this.refreshBtn.disabled = loading;
        },

        // Display error messages in the console
        showError(message) {
            console.error("Clients Errors: ", message);
        },
    };
}