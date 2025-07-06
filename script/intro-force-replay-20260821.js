(function () {
    const forceIntro = new URLSearchParams(window.location.search).get('intro') === '1';
    if (forceIntro) sessionStorage.removeItem('introShown');
})();
