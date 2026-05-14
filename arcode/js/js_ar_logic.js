AFRAME.registerComponent('ar-card-logic', {
    schema: { 
        hdId: { type: 'string' },
        jsonPath: { type: 'string' } 
    },
    
    init: function () {
        const el = this.el;
        const hdId = this.data.hdId;

        // Faz a requisição saindo da pasta arcode através do caminho definido no HTML
        fetch(this.data.jsonPath)
            .then(response => {
                if (!response.ok) throw new Error("Erro ao carregar o arquivo JSON");
                return response.json();
            })
            .then(data => {
                // Obtém o nome do projeto (ex: "ABC de Luta - Preservação...")
                const projetoNome = Object.keys(data)[0]; 
                
                const labelNome = el.querySelector('.lbl-nome');
                const labelExtra = el.querySelector('.lbl-extra');

                if (labelNome && projetoNome) {
                    // Limita o tamanho do texto para caber no card 3D
                    labelNome.setAttribute('value', projetoNome.substring(0, 25) + "...");
                }
                
                if (labelExtra) {
                    labelExtra.setAttribute('value', `ID: ${hdId.toUpperCase()} | ONLINE`);
                }
            })
            .catch(err => {
                console.error("Erro no fetch:", err);
                const labelNome = el.querySelector('.lbl-nome');
                if (labelNome) labelNome.setAttribute('value', "Erro ao ler dados");
            });

        // Proteção contra cliques automáticos
        let clickEnabled = false;
        setTimeout(() => { clickEnabled = true; }, 1500);

        const onAction = (e) => {
            if (!clickEnabled) return;
            if (e) e.preventDefault();
            // Redireciona mantendo-se dentro da estrutura da pasta arcode
            window.location.href = `Mapas_HTML/${hdId}.html`;
        };

        el.addEventListener('click', onAction);
        el.addEventListener('touchstart', onAction, { passive: false });
    }
});
