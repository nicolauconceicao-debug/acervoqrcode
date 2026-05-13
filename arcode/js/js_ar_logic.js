AFRAME.registerComponent('ar-card-logic', {
    schema: { 
        hdId: { type: 'string' },
        jsonPath: { type: 'string' } 
    },
    
    init: function () {
        const el = this.el;
        const hdId = this.data.hdId;

        // O fetch usará o ../ corretamente pois parte da URL do navegador
        fetch(this.data.jsonPath)
            .then(response => {
                if (!response.ok) throw new Error("Erro 404: Arquivo não encontrado no caminho " + this.data.jsonPath);
                return response.json();
            })
            .then(data => {
                const projetoNome = Object.keys(data)[0]; 
                const info = data[projetoNome];

                const labelNome = el.querySelector('.lbl-nome');
                const labelExtra = el.querySelector('.lbl-extra');

                if (labelNome) {
                    labelNome.setAttribute('value', projetoNome.substring(0, 25));
                }
                
                if (labelExtra) {
                    // Verificando se existe a pasta HV para contar entrevistas, como no seu JSON
                    let count = info.HV ? Object.keys(info.HV).length : 0;
                    labelExtra.setAttribute('value', `ID: ${hdId} | ${count} Entrevistas`);
                }
            })
            .catch(err => {
                console.error(err);
                // Feedback visual de erro no card para você saber que o caminho falhou
                el.querySelector('.lbl-nome').setAttribute('value', "Erro no JSON");
            });

        // Lógica de Clique
        let clickEnabled = false;
        setTimeout(() => { clickEnabled = true; }, 1500);

        const onAction = () => {
            if (!clickEnabled) return;
            // O caminho Mapas_HTML/ está dentro de arcode, então não precisa de ../
            window.location.href = `Mapas_HTML/${hdId}.html`;
        };

        el.addEventListener('click', onAction);
        el.addEventListener('touchstart', onAction);
    }
});
