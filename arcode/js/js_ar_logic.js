AFRAME.registerComponent('hd-handler', {
    schema: { hdId: {type: 'string'} },
    init: function () {
        // Função de redirecionamento isolada
        const redirecionar = () => {
            window.location.href = `Mapas_HTML/${this.data.hdId}.html`;
        };

        // Adicionamos 'touchstart' (Toque na tela do celular) e 'click' (Mouse no PC)
        this.el.addEventListener('click', redirecionar);
        this.el.addEventListener('touchstart', redirecionar);
    }
});
