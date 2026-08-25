// Citar figura/tabela no texto (#19, T11).
//
// ⚠️ O rotulo do botao e' "Citar figura/tabela", NAO "Inserir referencia": no
// TCC "Referencias" e' a bibliografia, e o aluno entenderia outra coisa.
//
// Espelha o plugin `citacao` (mesmo formato de plugin.js + dialogs/), que e' o
// precedente da casa para elemento proprio inserido no texto.
CKEDITOR.plugins.add('citar_ilustracao', {
    icons: 'citar_ilustracao',
    requires: 'dialog',

    onLoad: function() {
        // Mesma marcacao visual do `citacao`: quem le' o texto precisa
        // distinguir a mencao do texto corrido, e ela nao e' editavel a mao (o
        // numero vem do servidor).
        CKEDITOR.addCss('refilustracao' +
            '{' +
            'background-color: #eaf2fd;' +
            'border-bottom: 1px dotted #767676;' +
            ( CKEDITOR.env.gecko ? 'cursor: default;' : '' ) +
            '}' +
            // Mencao cujo alvo sumiu (a figura citada foi apagada): fica
            // VAZIA, porque o servidor nao inventa numero. Sem um aviso aqui
            // ela viraria um buraco invisivel no meio da frase. Ambar, nunca
            // vermelho -- em protanopia o vermelho some contra o cinza.
            'refilustracao:empty::before' +
            '{' +
            'content: "\\26A0 figura citada n\\00E3o existe mais";' +
            'color: #8A5A00;' +
            'font-style: italic;' +
            'font-size: 0.85em;' +
            '}'
        );
    },

    init: function(editor) {
        editor.addCommand('inserirCitacaoIlustracao', new CKEDITOR.dialogCommand('inserirCitacaoIlustracao'));

        editor.ui.addButton('CitarIlustracao', {
            label: 'Citar figura/tabela',
            command: 'inserirCitacaoIlustracao',
            toolbar: 'editing'
        });

        CKEDITOR.dialog.add('inserirCitacaoIlustracao', this.path + 'dialogs/citar_ilustracao.js');
    }
});

CKEDITOR.plugins.citar_ilustracao = {
    // Insere a mencao no ponto do cursor.
    //
    // ⚠️ O texto visivel entra aqui so' para o aluno ver o resultado NA HORA --
    // a verdade e' o `data-alvo`. O servidor reescreve esse texto a cada save e
    // a cada abertura da tela (HTMLProcessor#renumera_mencoes), porque inserir
    // uma figura ANTES muda o numero de todas as seguintes. E no PDF quem manda
    // e' o `\ref`, resolvido pelo proprio LaTeX.
    inserir: function(editor, ref, rotulo) {
        var mencao = editor.document.createElement('refilustracao');

        mencao.setAttributes({
            contentEditable: 'false',
            'data-alvo': ref
        });
        mencao.setText(rotulo);

        editor.insertElement(mencao);
    }
};
