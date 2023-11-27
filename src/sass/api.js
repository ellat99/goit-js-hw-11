import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
// Calificativul default indică că această clasă este exportată ca obiect implicit al modulului.
export default class ApiService {
  constructor() {
    //am folosit pentru a scrie in search orice ne dorim ca apoi sa ne dea pozele cu ceea ce am cerut
    this.searchQuery = '';
    //ne da o singura pagina cu imaginile
    this.page = 1;
    //iar pe pagina sa fie maxim 40 de elemente
    this.PER_PAGE = 40;
  }
  //Funcția fetchImages este o metodă asincronă care se ocupă de efectuarea solicitării către API-ul Pixabay pentru a obține imaginile pe care le dorim
  async fetchImages() {
    const options = {
      method: 'GET',
      url: 'https://pixabay.com/api/',
      params: {
        key: '40810721-4617741b248e6711ba03b05ba',
        q: `${this.searchQuery}`,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: `${this.page}`,
        per_page: `${this.PER_PAGE}`,
      },
    };
    try {
      //axios(options) returnează o promisiune, iar cu await așteptăm ca acea promisiune să fie rezolvată, adică să primim răspunsul de la API.
      //Dacă solicitarea este făcută cu succes, răspunsul de la API este stocat în variabila response
      const response = await axios(options);
      this.incrementPage();
      return response.data;
    } catch (error) {
      Notify.failure(`Oops! Something went wrong! Error:` + error);
    }
  }
  // Este utilă pentru a urmări paginile atunci când efectuezi solicitări consecutive, trecând de la o pagină la alta.
  incrementPage() {
    this.page += 1;
  }
  //Această metodă setează valoarea proprietății page la 1. Este utilă atunci când dorești să resetezi
  //numărul paginii la valoarea inițială, de exemplu, când utilizatorul introduce un nou termen de căutare.
  resetPage() {
    this.page = 1;
  }
  //returnează valoarea curentă a searchQuery
  get query() {
    return this.searchQuery;
  }
  //setează noua valoare pentru searchQuery.
  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
