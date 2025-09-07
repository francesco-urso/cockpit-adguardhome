import { getFilteringStatus, updateFilters, addFilter, removeFilter } from './api.js'

// Filters Panel
export function initFiltersPanel() {
    return {
        element: document.getElementById('filters-panel'),
        refreshBtn: document.getElementById('refresh-filters'),
        updateBtn: document.getElementById('update-filters'),
        filtersList: document.getElementById('filters-list'),

        async init() {
            if (this.refreshBtn) this.refreshBtn.addEventListener('click', () => this.loadData())
            if (this.updateBtn) this.updateBtn.addEventListener('click', () => this.updateAllFilters())
            await this.loadData()
        },

        // Load filtering status and filters list
        async loadData() {
            try {
                this.setLoading(true)
                const filteringStatus = await getFilteringStatus()
                this.updateUI(filteringStatus)
            } catch (error) {
                this.showError(error.message)
            } finally {
                this.setLoading(false)
            }
        },

        // Update all filters by fetching the latest versions
        async updateAllFilters() {
            try {
                this.setLoading(true)
                await updateFilters()
                await this.loadData()
                if (window.showMessage) {
                    window.showMessage('Filters updated successfully', 'success')
                }
            } catch (error) {
                this.showError(error.message)
            } finally {
                this.setLoading(false)
            }
        },

        // Update the UI with the list of filters
        updateUI(filteringStatus) {
            this.filtersList.innerHTML = ''

            if (filteringStatus.filters && filteringStatus.filters.length > 0) {
                filteringStatus.filters.forEach(filter => {
                    const item = document.createElement('div')
                    item.className = 'list-group-item'
                    item.innerHTML = `
            <div class="row">
              <div class="col-md-8">
                <strong>${filter.name || "Unnamed filter"}</strong>
                <p>${filter.url}</p>
                <p>Rules: ${filter.rules_count || 0}</p>
              </div>
              <div class="col-md-4 text-right">
                <span class="badge">${filter.enabled ? "Enabled" : "Disabled"}</span>
                <span class="badge">${filter.last_updated || "Never updated"}</span>
              </div>
            </div>
          `;
                    this.filtersList.appendChild(item)
                })
            } else {
                this.filtersList.innerHTML = '<div class="list-group-item">No filters found</div>'
            }
        },

        // Enable or disable buttons during loading
        setLoading(loading) {
            if (this.refreshBtn) this.refreshBtn.disabled = loading
            if (this.updateBtn) this.updateBtn.disabled = loading
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