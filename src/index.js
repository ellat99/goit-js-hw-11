import { Notify } from 'notiflix';
import ApiService from '../src/sass/api.js';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const formInput = document.getElementById('search-box');

const galleryContainer = document.getElementById('gallery');
//numărul de elemente pe care dorim să le afișăm pe pagină.
const PER_PAGE = 40;
//: Numărul actual de elemente pe pagină, inițializat cu valoarea PER_PAGE
let per_page = PER_PAGE,
  //Numărul total de pagini disponibile
  totalPages = 1,
  //nu s-a ajuns la sfârșitul rezultatelor
  endreached = false,
  lightbox;
const apiService = new ApiService();

// se întreprind mai multe acțiuni atunci când utilizatorul efectuează o căutare.
function onSearch(element) {
  element.preventDefault();
  //DACA DAU REFERSH LA pagina se sterg imaginile care erau ceea ce face loc la imaginile noi
  galleryContainer.innerHTML = '';
  //ne spune ca mai sunt imagini cu pisici
  endreached = false;
  //pentru a asigura că utilizatorul începe să vizualizeze rezultatele de la începutul paginii după fiecare căutare.
  //adica sterge imaginile anterioare daca scriem in search altceva
  scrollTopBtn.style.display = 'none';
  //Se elimină spațiile albe de la începutul și sfârșitul valorii cu .trim() pentru a evita căutările invalide sau goale.
  apiService.query = formInput.value.trim();
  apiService.resetPage();
  if (apiService.query == '') {
    Notify.warning('Please,fiil the main field!');
    return;
    // pentru a încărca imaginile corespunzătoare termenului de căutare în galerie
  }
  fetchGallery();
}
//solicitam imagini cu ceea ce ne dorim
async function fetchGallery() {
  //verificam daca nr de pagini apiService este mai mare decat nr de pagini stabilit de noi totalPages
  if (apiService.page > totalPages) {
    Notify.info("We're sorry,but you've reached the end of search results.");
    //aratam ca am ajuns la final
    endreached = true;
    //blocam scroll pentru a nu mai da in jos,Afișăm butonul pentru a derula sus în pagină
    scrollTopBtn.style.display = 'block';
    //am incheiat executia
    return;
  }
  const result = await apiService.fetchImages();
  if (!result) {
    formInput.value = '';

    return;
  }
  //in cazul in care uitliz a ajuns pe pagina 2 si nu a gasit imagini afisam o notificare de eroare
  const { hits, total } = result;
  if (apiService.page === 2) {
    if (total === 0) {
      Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
      return;
    }
    totalPages = Math.floor(total / per_page) + 1;
    //mesaj ca au fost gasite imaginile dorite si afisarea nr total de pagini
    Notify.success(`Hooray! We found ${total} images !!!`);
  }
  //afisam imaginile pe pagina
  displayImages(hits);
  //verificam daca suntem pe pagina 2
  if (apiService.page === 2) {
    lightbox = new SimpleLightbox('.gallery a', {
      //pt a afisa titlurile imaginilor
      caption: true,
      //TITLURILE imaginilor trebuie extrase din alt
      captionData: 'alt',
      //o intarziere de 2 sec jum pentru afisarea pozelor
      captionDelay: 250,
    });
  } else {
    lightbox.refresh();
  }
}

function displayImages(images) {
  const markup = images
    //iteram fiecare obiect in parte
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-cards">
    <a href="${largeImageURL}">
    <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy"/>
</a>
<div class="info">
  <p class="info-item"><b>Likes</b>  ${likes} </p>
  <p class="info-item"><b>Views</b>  ${views} </p>
  <p class="info-item"><b>Comments</b>  ${comments} </p>
  <p class="info-item"><b>Downloads</b>  ${downloads} </p>
</div>
</div>`;
      }
    )
    //transformam lista de markup intr un sir unic folosind join
    .join('');
  galleryContainer.insertAdjacentHTML('beforeend', markup);
  if (apiService.pages > totalPages) {
    scrollTopBtn.style.display = 'block';
  }
}
searchForm.addEventListener('submit', onSearch);
//ajută la împiedicarea unui număr mare de apeluri ale aceleiași funcții într-un interval scurt
let throttlePause;
const throttle = (callback, time) => {
  if (throttlePause) return;
  throttlePause = true;
  setTimeout(() => {
    callback();
    throttlePause = false;
  }, time);
};
const handleInfiniteScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5 && !endreached) {
    fetchGallery();
  }
};

window.addEventListener('scroll', () => {
  throttle(handleInfiniteScroll, 250);
});
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerText = 'Back';
scrollTopBtn.id = 'scroll-top';
document.body.appendChild(scrollTopBtn);
scrollTopBtn.addEventListener('click', () => {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
});
