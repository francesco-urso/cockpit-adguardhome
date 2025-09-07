import { getStats, getQueryLog } from './api.js'

// Statistics Panel
export function initStatisticsPanel() {
    return {
        element: document.getElementById('statistics-panel'),
        refreshBtn: document.getElementById('refresh-stats'),
        queriesElement: document.getElementById('dns-queries'),
        blockedElement: document.getElementById('blocked-queries'),
        percentageElement: document.getElementById('blocked-percentage'),

        async init() {
            this.refreshBtn.addEventListener('click', () => this.loadData())
            await this.loadData()
            setInterval(() => this.loadData(), 30000)
        },

        // Load statistics and query log
        async loadData() {
            try {
                this.setLoading(true)
                const [stats, queryLog] = await Promise.all([
                    getStats(),
                    getQueryLog(10)
                ])
                this.updateUI(stats, queryLog)
            } catch (error) {
                this.showError(error.message)
            } finally {
                this.setLoading(false)
            }
        },

        // Update the UI with statistics and query log
        updateUI(stats, queryLog) {
            this.queriesElement.textContent = stats.num_dns_queries || 0
            this.blockedElement.textContent = stats.num_blocked_filtering || 0

            const percentage = stats.num_dns_queries > 0
                ? ((stats.num_blocked_filtering / stats.num_dns_queries) * 100).toFixed(1)
                : 0
            this.percentageElement.textContent = `${percentage}%`

            this.updateQueryLogTable(queryLog)
        },

        // Populate the query log table with recent queries
        updateQueryLogTable(queryLog) {
            const tbody = document.getElementById('query-log-body')
            tbody.innerHTML = ''

            if (queryLog.data && queryLog.data.length > 0) {
                queryLog.data.forEach(query => {
                    const row = document.createElement('tr')

                    const isBlocked = query.reason && (
                        query.reason.includes('Filtered') ||
                        query.reason === 'FilteredBlackList' ||
                        query.filterId !== undefined
                    );

                    const queryTime = new Date(query.time);
                    const formattedTime = isNaN(queryTime.getTime())
                        ? query.time
                        : queryTime.toLocaleTimeString();

                    const domain = query.question && query.question.name
                        ? query.question.name
                        : "N/A";

                    const type = query.question && query.question.type
                        ? query.question.type
                        : "N/A";

                    row.innerHTML = `
                <td>${formattedTime}</td>
                <td>${domain}</td>
                <td>${type}</td>
                <td>
                    <span class="label label-${isBlocked ? "danger" : "success"}">
                        ${isBlocked ? "Blocked" : "Allowed"}
                    </span>
                    ${query.reason ? `<br><small>${query.reason}</small>` : ''}
                </td>
            `;
                    tbody.appendChild(row)
                })
            } else {
                tbody.innerHTML = '<tr><td colspan="4">No queries found</td></tr>'
            }
        },

        // Enable or disable buttons during loading
        setLoading(loading) {
            this.refreshBtn.disabled = loading
        },

        showError(message) {
            console.error("Statistics Error: ", message);
        }
    }
}