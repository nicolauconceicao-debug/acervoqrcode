AFRAME.registerComponent('marker-handler', {
    schema: { 
        hdId: { type: 'string' },
        jsonPath: { type: 'string' } 
    },
    
    init: function () {
        const marker = this.el;
        const hdId = this.data.hdId;
        const jsonPath = this.data.jsonPath;
        
        const bottomCard = document.querySelector('#bottom-card');
        const statusText = document.querySelector('#status-text');
        const btnExplorar = document.querySelector('#btn-explorar');

        let dadosCarregados = false;

        // Quando a câmera encontra o marcador
        marker.addEventListener('markerFound', () => {
            statusText.innerText = "HD Encontrado!";
            bottomCard.classList.add('visible'); // Faz o card deslizar para cima

            // Se os dados ainda não foram baixados, baixa agora
            if (!dadosCarregados) {
                fetch(jsonPath)
                    .then(res => {
                        if(!res.ok) throw new Error("Caminho do JSON incorreto");
                        return res.json();
                    })
                    .then(data => {
                        const projetoNome = Object.keys(data)[0];
                        document.querySelector('#info-nome').innerText = projetoNome;
                        document.querySelector('#info-extra').innerText = `ID: ${hdId.toUpperCase()} | ONLINE`;
                        dadosCarregados = true;
                    })
                    .catch(err => {
                        console.error(err);
                        document.querySelector('#info-nome').innerText = "Erro ao ler os dados do acervo";
                    });
            }

            // Configura o link do botão (Corrige o erro de "página não encontrada")
            btnExplorar.onclick = () => {
                // Aqui você ajusta o caminho exato onde estão os seus mapas
                // Se a pasta Mapas_HTML estiver na mesma pasta que ar_museu.html:
                window.location.href = `Mapas_HTML/${hdId}.html`; 
            };
        });

        // Quando a câmera perde o marcador
        marker.addEventListener('markerLost', () => {
            statusText.innerText = "Aponte para o marcador do HD";
            bottomCard.classList.remove('visible'); // Esconde o card
        });
    }
});
