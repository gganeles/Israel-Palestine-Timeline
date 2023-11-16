const idList = [1, 2, 3]; // Replace with your list of IDs
const apiUrl = 'https://example.com/api/data/';

// Function to fetch JSON data for a given ID
async function fetchDataById(id) {
    const response = await fetch(`${apiUrl}${id}`);
    const data = await response.json();
    return data;
}

// Function to filter JSON data based on a condition (modify as needed)
function filterData(data) {
    return data.filter(item => item.someProperty === 'desiredValue');
}

// Function to fetch and filter data for each ID in the list
async function fetchAndFilterData() {
    const allData = await Promise.all(idList.map(id => fetchDataById(id)));
    const filteredData = allData.map(data => filterData(data));
    return filteredData;
}

// Example usage
fetchAndFilterData().then(result => console.log(result));
