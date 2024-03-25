document.addEventListener('DOMContentLoaded', function () {
  const newsTableBody = document.getElementById('newsTableBody');
  const carouselInner = document.querySelector('.carousel-inner');
  const newsContainer = document.getElementById('newsContainer');

  let favorites = [];


  function populateCarousel(articlesData) {
    carouselInner.innerHTML = '';
    newsContainer.innerHTML = '';

    for (let i = 0; i < 3; i++) {
      const article = articlesData[i];
      const item = document.createElement('div');
      item.classList.add('carousel-item');
      if (i === 0) {
        item.classList.add('active');
      }
      const imageUrl = article.urlToImage ? article.urlToImage : 'img/def.jpg';
      item.innerHTML = `
        <img src="${imageUrl}" class="d-block w-100" alt="...">
        <div class="carousel-caption d-none d-md-block">
          <h5>${article.title}</h5>
          <p>${article.description}</p>
        </div>
      `;
      carouselInner.appendChild(item);
    }
  }

  function populateNews(articlesData) {
    newsTableBody.innerHTML = '';
    newsContainer.innerHTML = '';

    for (let i = 3; i < 12; i += 4) {
      const row = document.createElement('tr');
      for (let j = 0; j < 4; j++) {
        const index = i + j;
        if (index >= articlesData.length) break;

        const article = articlesData[index];
        const cell = document.createElement('td');
        const imageUrl = article.urlToImage ? article.urlToImage : 'img/def.jpg';
        cell.innerHTML = `
          <div class="card">
            <img class="card-img-top" src="${imageUrl}" alt="Image">
            <div class="card-body">
              <h5 class="card-title">${article.title}</h5>
              <p class="card-text">${article.description}</p>
              <a href="${article.url}" class="btn btn-primary" target="_blank">Read More</a>
              <img class="favorite-icon" src="img/heart.svg" alt="Favorite" data-article-id="${article.id}">
            </div>
          </div>
        `;
        row.appendChild(cell);
      }
      newsTableBody.appendChild(row);
    }
  }
  //---------------------------CERCA---------------------------------
  function searchNews(searchText) {
    fetch(`http://localhost:3000/news-day?query=${searchText}`)
      .then(response => response.json())
      .then(data => {
        populateCarousel(data.articles); // Popola il carosello con le prime 3 notizie
        populateNews(data.articles); // Popola le restanti notizie nella tabella
      })
      .catch(error => console.error('Error fetching news:', error));
  }

  const searchForm = document.getElementById('searchForm');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchText = document.getElementById('txtsearch').value.trim();
    if (searchText) {
      searchNews(searchText);
    } else {
      fetch('http://localhost:3000/top-headlines')
        .then(response => response.json())
        .then(data => {
          populateCarousel(data.articles); // Popola il carosello con le prime 3 notizie
          populateNews(data.articles); // Popola le restanti notizie nella tabella
        })
        .catch(error => console.error('Error fetching news:', error));
    }
  });


  //-----------------------PREFERITI--------------------------------------------
  function updateFavorites(article) {
    const index = favorites.findIndex(favorite => favorite && favorite.title === article.title);
    if (index === -1) {
      favorites.push(article);
      console.log('Articolo aggiunto ai preferiti:', article.title);
    } else {
      favorites.splice(index, 1);
      console.log('Articolo rimosso dai preferiti:', article.title);
    }
    // Aggiorna l'array dei preferiti nel localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    console.log(favorites);
  }




  function showFavorites() {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites'));
    if (storedFavorites === null || storedFavorites.length === 0) {
      newsContainer.innerHTML = '<div class="col"><p class="text-center">Nessuna news preferita</p></div>';
    } else {
      populateFavorites(storedFavorites);
    }
  }


  // Aggiungi event listener per il click sull'icona del cuore
  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('favorite-icon')) {
      const articleCard = event.target.closest('.card');
      const articleTitleElement = articleCard.querySelector('.card-title');

      // Verifica se l'elemento del titolo dell'articolo è stato trovato
      if (articleTitleElement) {
        const articleTitle = articleTitleElement.textContent;
        const isFavorite = event.target.src.includes('heart-fill.svg');

        // Trova e salva l'articolo relativo alla card
        const article = articles.find(article => article.title === articleTitle);

        // Assicurati che l'articolo sia stato trovato
        if (article) {
          // Controlla se l'articolo è già presente nei preferiti
          const index = favorites.findIndex(favorite => favorite.title === articleTitle);

          if (isFavorite) {
            // Rimuovi l'icona del cuore pieno
            event.target.src = 'img/heart.svg';

            // Rimuovi l'articolo dai preferiti solo se è presente
            if (index !== -1) {
              favorites.splice(index, 1);
              // Aggiorna l'array dei preferiti nel localStorage
              localStorage.setItem('favorites', JSON.stringify(favorites));
              console.log('Articolo rimosso dai preferiti:', articleTitle);
            }
          } 
          else {
            // Aggiungi l'icona del cuore pieno
            event.target.src = 'img/heart-fill.svg';

            // Aggiungi l'articolo ai preferiti solo se non è già presente
            if (index === -1) {
              updateFavorites(article);
              console.log('Articolo aggiunto ai preferiti:', article.title);
            }
          }
        } else {
          console.error('Articolo non trovato:', articleTitle);
        }
      } else {
        console.error('Elemento del titolo dell\'articolo non trovato');
      }
    }
  });




  // Aggiungi event listener per il click sul link "Preferiti"
  favoritesLink.addEventListener('click', function (event) {
    event.preventDefault();
    showFavorites();
  });
  function populateFavorites(articlesData) {
    newsContainer.innerHTML = '';
    carouselInner.innerHTML = '';
    newsTableBody.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = 'Ecco qui i tuoi preferiti:';
    newsContainer.appendChild(title);


    articlesData.forEach(article => {
      const imageUrl = article.urlToImage ? article.urlToImage : 'img/def.jpg';
      const card = `
        <div class="col-md-3">
          <div class="card">
            <img class="card-img-top" src="${imageUrl}" alt="Image">
            <div class="card-body">
              <h5 class="card-title">${article.title}</h5>
              <p class="card-text">${article.description}</p>
              <a href="${article.url}" class="btn btn-primary" target="_blank">Read More</a>
              <img class="favorite-icon" src="img/heart-fill.svg" alt="Favorite">
            </div>
          </div>
        </div>
      `;
      newsContainer.insertAdjacentHTML('beforeend', card);
    });
  }




  //----------------------CATEGORIA-------------------------------------------



  const navLinks = document.getElementsByName('category');
  navLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const category = this.getAttribute('data-category');
      fetch(`http://localhost:3000/news-cat?query=${category}`)
        .then(response => response.json())
        .then(data => {

          populateNews(data.articles); // Popola le restanti notizie nella tabella
          populateCarousel(data.articles); // Popola il carosello con le prime 3 notizie
        })
        .catch(error => console.error('Error fetching news:', error));
    });
  });


  //------------------------------------------------------------------


  fetch(`http://localhost:3000/top-headlines`)
    .then(response => response.json())
    .then(data => {
      articles = data.articles;
      populateCarousel(articles);
      populateNews(articles);
    })
    .catch(error => console.error('Error fetching news:', error));
});


















