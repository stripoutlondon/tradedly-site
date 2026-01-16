
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  const resultsDiv = document.getElementById('search-results');
  input.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();
    resultsDiv.innerHTML = '';
    if (query.length > 1) {
      const results = siteData.filter(item => item.title.toLowerCase().includes(query));
      if (results.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No results found.';
        resultsDiv.appendChild(p);
      } else {
        const ul = document.createElement('ul');
        results.forEach(item => {
          const li = document.createElement('li');
          const link = document.createElement('a');
          link.href = item.url;
          link.textContent = item.title;
          li.appendChild(link);
          ul.appendChild(li);
        });
        resultsDiv.appendChild(ul);
      }
    }
  });
});
