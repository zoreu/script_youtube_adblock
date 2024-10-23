// ==UserScript==
// @name         Bloqueador de Anúncios YouTube (Interceptando JS, com Logs)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Bloqueia anúncios no YouTube, interceptando funções JavaScript e removendo elementos.
// @author       zoreu
// @match        *://www.youtube.com/*
// @grant        none
// @run-at       document-start
// @run-in       incognito-tabs
// ==/UserScript==

(function() {
  'use strict';

  console.log('Script de bloqueio de anúncios está ativo.');

  // Interceptar e bloquear chamadas para anúncios do YouTube
  const blockAdsFunctions = () => {
    // Intercepta o método usado para requisitar anúncios de vídeo
    Object.defineProperty(window, 'ytInitialPlayerResponse', {
      set: function(response) {
        if (response && response.adPlacements) {
          console.log('Interceptação de anúncio: Removendo adPlacements');
          // Remove anúncios do player de vídeo
          delete response.adPlacements;
        }
        this._ytInitialPlayerResponse = response;
      },
      get: function() {
        return this._ytInitialPlayerResponse;
      },
      configurable: true
    });

    // Intercepta a função responsável por carregar informações do vídeo
    Object.defineProperty(window, 'ytplayer', {
      set: function(player) {
        if (player && player.config && player.config.args) {
          // Remove parâmetros de anúncios do vídeo
          if (player.config.args.ad3_module) {
            console.log('Interceptação de anúncio: Removendo ad3_module');
            delete player.config.args.ad3_module;
          }
        }
        this._ytplayer = player;
      },
      get: function() {
        return this._ytplayer;
      },
      configurable: true
    });
  };

  // Função para remover os elementos de anúncios da interface
  const removeAdElements = () => {
    const adSelectors = [
      '.video-ads',               // Anúncios de vídeo
      '#masthead-ad',             // Banner do topo
      '#player-ads',              // Anúncios no player
      '.ytp-ad-module',           // Módulos de anúncios dentro do player
      '.ytp-ad-overlay-container',// Sobreposições de anúncios no player
      '.ytp-ad-skip-button',      // Botão de pular anúncio
      '.ytp-ad-text'              // Texto de anúncio dentro do player
    ];

    adSelectors.forEach(selector => {
      const ads = document.querySelectorAll(selector);
      ads.forEach(ad => {
        console.log(`Removendo anúncio: ${selector}`, ad);
        ad.remove();
      });
    });
  };

  // Usar MutationObserver para monitorar alterações dinâmicas no DOM
  const observeDOMChanges = () => {
    const observer = new MutationObserver(() => {
      removeAdElements();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  // Executar funções quando o documento estiver pronto
  window.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada. Interceptando funções e removendo anúncios.');
    blockAdsFunctions();  // Bloqueia funções responsáveis por carregar anúncios
    observeDOMChanges();  // Observa o DOM para remover anúncios que aparecem dinamicamente
    removeAdElements();   // Remove anúncios existentes
  });

})();
