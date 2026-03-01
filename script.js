async function loadInventory() {
    const response = await fetch('/api/inventory');
    const data = await response.json();
    const tableBody = document.querySelector('#inventoryTable tbody');

    tableBody.innerHTML = data.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.item_name}</td>
            <td>${item.category}</td>
            <td><span class="status-tag">${item.status}</span></td>
        </tr>
    `).join('');
}

loadInventory();
document.addEventListener('DOMContentLoaded', () => {
    fetchInventory();
});

async function fetchInventory() {
    try {
        const response = await fetch('/api/inventory');
        const data = await response.json();
        
        const tableBody = document.getElementById('inventory-list');
        const totalItems = document.getElementById('totalItems');
        const availableItems = document.getElementById('availableItems');
        const damagedItems = document.getElementById('damagedItems');

        // Clear existing static rows
        tableBody.innerHTML = '';

        let availableCount = 0;
        let damagedCount = 0;

        data.forEach(item => {
            // Count stats
            if (item.status === 'Available') availableCount++;
            if (item.status === 'Damaged') damagedCount++;

            // Create table row
            const row = `
                <tr>
                    <td>#${item.id}</td>
                    <td style="font-weight: 600; color: #38bdf8;">${item.item_name}</td>
                    <td>${item.category}</td>
                    <td>
                        <span class="status-tag status-${item.status.toLowerCase()}">
                            ${item.status}
                        </span>
                    </td>
                    <td>
                        <button class="action-btn" onclick="requestItem(${item.id})">Request</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        // Update stats cards
        totalItems.innerText = data.length;
        availableItems.innerText = availableCount;
        damagedItems.innerText = damagedCount;

    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
}

function requestItem(id) {
    alert('Request sent for Item ID: ' + id);
}