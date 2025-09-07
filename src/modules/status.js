import { getStatus, toggleProtection } from './api.js'

// Status Panel
export function initStatusPanel() {
    return {
        element: document.getElementById('status-panel'),
        refreshBtn: document.getElementById('refresh-status'),
        toggleBtn: document.getElementById('toggle-protection'),
        statusText: document.getElementById('protection-status'),
        dnsText: document.getElementById('dns-addresses'),

        async init() {
            if (this.refreshBtn) this.refreshBtn.addEventListener('click', () => this.loadData())
            if (this.toggleBtn) this.toggleBtn.addEventListener('click', () => this.toggleProtection())
            await this.loadData()
        },

        // Load the current status from the API
        async loadData() {
            try {
                this.setLoading(true)
                const status = await getStatus()
                this.updateUI(status)
            } catch (error) {
                console.error("Error loading status: ", error);
                this.showError(
                    `Unable to connect to AdGuard Home. Please check: 
                    1) that the service is active
                    2) that your credentials are correct
                    3) that there are no network or CORS issues.
                    `)
            } finally {
                this.setLoading(false)
            }
        },

        // Toggle protection on or off
        async toggleProtection() {
            try {
                const status = await getStatus()
                const newStatus = !status.protection_enabled
                await toggleProtection(newStatus)
                await this.loadData()
                if (window.showMessage) {
                    window.showMessage(
                        `Protection ${newStatus ? "enable" : "disable"}`,
                        "success"
                    );
                }
            } catch (error) {
                console.error("Error toggling protection: ", error);
                this.showError('Unable to change protection status.')
            }
        },

        // Update the UI with the current status
        updateUI(status) {
            if (this.statusText) this.statusText.textContent = status.protection_enabled ? 'ENABLE' : 'DISABLED'
            if (this.statusText) this.statusText.className = status.protection_enabled ? 'text-success' : 'text-danger'
            if (this.toggleBtn) {
                this.toggleBtn.textContent = status.protection_enabled ? 'Disable' : 'Enable'
                this.toggleBtn.className = status.protection_enabled ? 'btn btn-danger' : 'btn btn-success'
            }
            if (this.dnsText) this.dnsText.textContent = status.dns_addresses ? status.dns_addresses.join(', ') : 'N/A'
        },

        // Enable or disable buttons during loading
        setLoading(loading) {
            if (this.refreshBtn) this.refreshBtn.disabled = loading
            if (this.toggleBtn) this.toggleBtn.disabled = loading
            if (loading) {
                if (this.statusText) this.statusText.textContent = 'Loading...'
                if (this.dnsText) this.dnsText.textContent = 'Loading...'
            }
        },

        showError(message) {
            if (window.showMessage) {
                window.showMessage(message, 'error')
            } else {
                console.error(message)
            }
        }
    }
}