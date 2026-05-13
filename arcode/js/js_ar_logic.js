// js/ar_logic.js

AFRAME.registerComponent('ar-card-logic', {
    schema: { 
        hdId: { type: 'string' },
        jsonPath: { type: 'string' } 
    },
    
    init: function () {
        const el = this.el;
        const hdId = this.data.hdId;

        // 1. Carregar dados do JSON Externo
        fetch(this.data.jsonPath)
            .then(response => response.json())
            .then(data => {
                this.updateCardData(el, data, hdId);
            })
            .catch(err => console.error("Erro ao carregar JSON:", err));

        // 2. Lógica de Clique com Proteção
        let clickEnabled = false;
        setTimeout(() => { clickEnabled = true; }, 1500);

        const onAction = (e) => {
            if (!clickEnabled) return;
            // Redireciona para a página do mapa
            window.location.href = `Mapas_HTML/${hdId}.html`;
        };

        el.addEventListener('click', onAction);
        el.addEventListener('touchstart', onAction);
    },

    updateCardData: function (el, data, hdId) {
        // Exemplo: Pegando o primeiro projeto do seu JSON
        const projetoNome = Object.keys(data)[0]; 
        const info = data[projetoNome];

        // Atualiza os textos no A-Frame
        const labelNome = el.querySelector('.lbl-nome');
        const labelExtra = el.querySelector('.lbl-extra');

        if (labelNome) labelNome.setAttribute('value', projetoNome.substring(0, 30) + "...");
        if (labelExtra) labelExtra.setAttribute('value', `ID: ${hdId} | Metadados OK`);
    }
});