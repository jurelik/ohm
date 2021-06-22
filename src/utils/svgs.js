const locationIcon = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="-100 -100 200 200"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M0 75c-40-30-60-60-60-90 0-33.137 26.862-60 60-60h0c33.137 0 60 26.863 60 60h0c0 30-20 60-60 90M0-60c-24.854 0-45 20.147-45 45h0c0 24.854 20.146 45 45 45h0c24.853 0 45-20.146 45-45h0c0-24.853-20.147-45-45-45h0"/></svg>';
const pinIcon = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="-100 -100 200 200"><path fill="none" stroke="#BBB" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M30 0h0v30l45-45-45-45v30H0M-30 0h0v-30l-45 45 45 45V30H0M-30 0h60"/></svg>';
const backIcon = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="-100 -100 200 200"><path fill="none" stroke-width="25" stroke-linecap="round" stroke-linejoin="round" d="M30-75h0L-30 0l60 75"/></svg>';
const forwardIcon = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="-100 -100 200 200"><path fill="none" stroke-width="25" stroke-linecap="round" stroke-linejoin="round" d="M-30-75h0L30 0l-60 75"/></svg>';
const refreshIcon = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="-100 -100 200 200"><path fill="none" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" d="M61.82-61.821h0v42.427H19.393m21.214-21.213c-23.431-23.432-61.421-23.432-84.853 0h0c-23.432 23.432-23.431 61.421 0 84.853h0c23.432 23.432 61.421 23.432 84.853 0h0m21.213-63.64h0L40.607-40.607"/></svg>';
const refreshIconSmall = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="-100 -100 200 200"><path fill="none" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" d="M61.82-61.821h0v42.427H19.393m21.214-21.213c-23.431-23.432-61.421-23.432-84.853 0h0c-23.432 23.432-23.431 61.421 0 84.853h0c23.432 23.432 61.421 23.432 84.853 0h0m21.213-63.64h0L40.607-40.607"/></svg>';
const playIcon = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="-100 -100 200 200"><path stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M-56.25-75c-8.285 0-15 6.716-15 15h0V60c0 8.285 6.715 15 15 15h0l120-60c10-10 10-20 0-30h0l-120-60"/></svg>';
const pauseIcon = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="-100 -100 200 200"><path stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M-60-75V75h30V-75h-30zm120 0H30V75h30V-75z"/></svg>';
const albumIcon = '<svg height="10" viewBox="-100 -100 200 200" width="10" xmlns="http://www.w3.org/2000/svg"><g fill="none"><path d="m-75 75h105v-120h-90c-8.285 0-15 6.716-15 15zm150-150h-90c-8.285 0-15 6.716-15 15v15m60 90h45v-120" stroke="#eee" stroke-linecap="round" stroke-linejoin="round" stroke-width="20"/></g></svg>';
const loadingIcon = '<div class="spinner"></div>';
const loadingIconSmall = '<div class="spinner-small"></div>';
const playIconBig = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="-100 -100 200 200"><path stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M-56.25-75c-8.285 0-15 6.716-15 15h0V60c0 8.285 6.715 15 15 15h0l120-60c10-10 10-20 0-30h0l-120-60"/></svg>';
const pauseIconBig = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="-100 -100 200 200"><path stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M-60-75V75h30V-75h-30zm120 0H30V75h30V-75z"/></svg>';
const deleteIcon = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="-100 -100 200 200"><path fill="none" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" d="M-75-75h0L75 75m-150 0h0L75-75"/></svg>';
const nextIcon = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="-100 -100 200 200"><path stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M-60-75c-8.285 0-15 6.716-15 15h0V60c0 8.285 6.715 15 15 15h0L60 15h0v60h15V-75H60v60h0L-60-75"/></svg>'
const previousIcon = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="-100 -100 200 200"><path stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M75-60c0-8.284-6.716-15-15-15h0L-60-15h0v-60h-15V75h15V15h0L60 75c8.284 0 15-6.715 15-15h0V-60"/></svg>'
const speakerIcon = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="-100 -100 200 200"><path fill="none" stroke="#ddd" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M-7.5-45h0l-30 30h-30v30h30l30 30v-90m30 15c20 20 20 40 0 60m15-90c40 40 40 80 0 120"/></svg>'
const searchIcon = '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="-100 -100 200 200"><path fill="none" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" d="M-15-75c-33.138 0-60 26.863-60 60h0c0 33.138 26.862 60 60 60 33.137 0 60-26.862 60-60 0-33.137-26.863-60-60-60h0M75 75h0L30 30"/></svg>'

module.exports = {
  locationIcon,
  pinIcon,
  backIcon,
  forwardIcon,
  refreshIcon,
  refreshIconSmall,
  playIcon,
  pauseIcon,
  albumIcon,
  loadingIcon,
  loadingIconSmall,
  playIconBig,
  pauseIconBig,
  deleteIcon,
  nextIcon,
  previousIcon,
  speakerIcon,
  searchIcon
}
