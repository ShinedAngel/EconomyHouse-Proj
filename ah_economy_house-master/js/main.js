var total = 0;
var tarifacao = 0;

//constantes
const selecione = 'Selecione';
const operacaoAdicionar = "adicionar";
const operacaoRemover = "remover";
const operacaoVerificar = "verificar";

//campos usados no form
var campoNomeItem = document.getElementById("Itens");
var campoQuantidade = document.getElementById("quantidade");
var campoPotencia = document.getElementById("potencia");
var campoHoras = document.getElementById("horas");
var campoDias = document.getElementById("dias");
var campoSelect = document.getElementById('Itens');



//usando o "data" do JSON (que estão os dados de codigo, item e potencia) e instanciando na variavel itens
var itens = JSON.parse(data);

//array de itens adicionados pelo usuario
var itensAdicionados = [];

//carrega os dados do body na inicialização do html(carrega os itens da var itens no campo do select)
function inicalizarSelectItens() {

    var opcao = "";
    itens.forEach(item => {
        opcao = document.createElement("option");
        opcao.text = item.nome;
        campoSelect.add(opcao);
    });
}


//função responsável por encontrar e retornar o id de acordo com o json
function pegarIdItem(nomeItem) {
    var idItem = 0;

    for (let i = 0; i < itens.length; i++) {
        if (nomeItem == itens[i].nome) {
            idItem = itens[i].id;
            break;
        }
    }

    return (idItem);
}
//Adiciona os dados no array e inibe adição de itens ja acrescentados, verificando tambem a consistencia dos dados inputados
function adicionar() {
    var potencia = 0;
    var horas = 0;
    var dias = 0;
    var quantidade = 0;
    var resultado = 0;
    const mil = 1000;
    var numeroItem = 0;
    var nomeItem = "";

    //R$ 07/06/2018
    var tarifaCalculada = 0;
    var tarifaconvencional = 0.58684;
    var iluminacaopublica = 0.32277;//0.90961

    var id = 0;
    var jaFoiAdicionado = false;


    //pegando valor campos
    nomeItem = campoNomeItem.value;
    quantidade = Number(campoQuantidade.value);
    potencia = Number(campoPotencia.value);
    horas = Number(campoHoras.value);
    dias = Number(campoDias.value);


    //validações
    let ok = false;
    ok = verificarCampos();

    if (ok == true) {

        resultado = (quantidade * potencia * horas * dias) / mil;
        //R$ 07/06/2018
        tarifaCalculada = resultado * ( tarifaconvencional + iluminacaopublica);

        id = pegarIdItem(nomeItem);

        jaFoiAdicionado = encontrarItem(operacaoVerificar, id, quantidade, resultado, potencia, dias, horas);
        if (jaFoiAdicionado == false) {

            total = Number(total) + Number(resultado);
                    //R$ 07/06/2018
            tarifacao = Number(tarifacao) + Number(tarifaCalculada);

            itensAdicionados.push({
                id: id,
                nome: nomeItem,
                quantidade: Number(quantidade),
                potencia: Number(potencia),
                horas: Number(horas),
                dias: Number(dias),
                gastoTotal: Number(resultado),

                //R$ 07/06/2018
                tarifacao: Number(tarifaCalculada),

            });

        } else {
            encontrarItem(operacaoAdicionar, id, quantidade, resultado, potencia, dias, horas);
        }
        atualizarTabela();
        atualizarCampoResultado();
        limparCampos();

    }



    //verifica se todos os dados estão conforme o esperado (ok true)
    function verificarCampos() {
        let ok = true;


        if (nomeItem === selecione) {
            ok = false;
            campoSelect.style.borderColor = "#fe8e8e";
        } else {
            campoSelect.style.borderColor = "initial";
        }

        if (!(quantidade > 0) || !(Number.isInteger(quantidade))) {

            ok = false;
            //alterando cor do campo quantidade
            campoQuantidade.style.borderColor = "#fe8e8e";
        } else {
            campoQuantidade.style.borderColor = "initial";
        }

        if (!(potencia > 0) || (isNaN(potencia))) {

            ok = false;
            //alterando cor do campo potencia
            campoPotencia.style.borderColor = "#fe8e8e";
        } else {
            campoPotencia.style.borderColor = "initial";
        }

        if (!(horas > 0) || !(horas <= 24) || !(Number.isInteger(horas))) {

            ok = false;
            //alterando cor do campo horas
            campoHoras.style.borderColor = "#fe8e8e";
        } else {
            campoHoras.style.borderColor = "initial";
        }
        if (!(dias > 0) || !(dias <= 31) || !(Number.isInteger(dias))) {

            ok = false;
            campoDias.style.borderColor = "#fe8e8e";
        } else {
            campoDias.style.borderColor = "initial";
        }
        return ok;
    }   
}


//atualiza tabela com os itens do array disponibilizando para o usuario a leitura
function atualizarTabela() {
    var tabela = document.getElementById('tabela');
    var corpoTabela = document.getElementById('corpo-tabela');
    var linhas = corpoTabela.rows.length;

    for (let i = 0; i < linhas; i++) {
        corpoTabela.deleteRow(0);

    }

    if (itensAdicionados.length != 0) {
        tabela.style.display = "table";
        itensAdicionados.forEach(item => {
            var linhaTabela =
                // selecionarLinha(qntLinhasTabela)
                '<tr onclick="">' +
                '<td>' + item.id + '</td>' +
                '<td>' + item.nome + '</td>' +
                '<td>' + item.quantidade + '</td>' +
                '<td>' + item.potencia + "W" + '</td>' +
                '<td>' + item.horas + '</td>' +
                '<td>' + item.dias + '</td>' +
                '<td>' + (item.gastoTotal.toFixed(2)) + " kWh" + '</td>' +
                //R$ 07/06/2018
                '<td>' + "R$ " + (item.tarifacao.toFixed(2)) + '</td>' +
                '<td class="iconeExcluir" onclick="deletarLinha(' +
                (tabela.rows.length - 1) + "," + item.id + "," +
                item.quantidade + "," + item.potencia + "," + item.dias +
                "," + item.horas + "," + item.gastoTotal + "," + item.tarifacao + ')">' +
                '<span>' + '<img src="img/x.png" >' + '<span/>' + '</td>' +
                '</tr>'
                ;
            corpoTabela.innerHTML += linhaTabela;
        });
    } else {
        tabela.style.display = 'none';

    }
}

//funçao para encontrar e Adicionar ou Remover item do array e atualizar variavel total
function encontrarItem(op, id, qnt, gastoTotal, potencia, dias, horas) {
    var encontrado = false;

    for (let i = 0; i < itensAdicionados.length; i++) {
        if (id == itensAdicionados[i].id && potencia == itensAdicionados[i].potencia && dias == itensAdicionados[i].dias && horas == itensAdicionados[i].horas) {
            indice = i;
            encontrado = true;
            switch (op) {
                case operacaoAdicionar:
                    itensAdicionados[i].quantidade += Number(qnt);
                    itensAdicionados[i].gastoTotal += Number(gastoTotal);
                    total += gastoTotal;
                    break;

                case operacaoRemover:
                    itensAdicionados.splice(i, 1);
                    total -= gastoTotal;
                    break;

                default:

                    break;
            }
            atualizarCampoResultado();
        }
    }
    return encontrado;
}


// atualiza campo resultado
function atualizarCampoResultado() {

    campoResultado = document.getElementById('resultado');
    campoResultado.value = "";
    campoResultado.value += (Number(total).toFixed(2)) + " kWh";

    //R$ 07/06/2018
    campoTarifacao = document.getElementById('tarifacao');
    campoTarifacao.value = "";
    campoTarifacao.value += ("R$ " + Number(tarifacao).toFixed(2));

}

//função para preencher o campo de potencia qnd o usuário selecionar o item
function preencherCampoPotencia() {


    var itemSelecionado = campoSelect.value;

    if (itemSelecionado !== selecione) {

        var id = pegarIdItem(itemSelecionado);
        var potencia = 0;

        for (let i = 0; i < itens.length; i++) {
            if (itens[i].id == id) {
                potencia = itens[i].potencia;
                break;
            }
        }
        campoPotencia.value = potencia;

    }
}

//função para deletar linha da tabela
function deletarLinha(linha, id, qnt, potencia, dias, horas, gastoTotal) {
    tabela = document.getElementById('corpo-tabela');
    encontrarItem(operacaoRemover, id, qnt, gastoTotal, potencia, dias, horas);
    tabela.deleteRow(linha);
    atualizarTabela();
    atualizarCampoResultado();
}

//função para limpar os itens para novo registro e nova adição do usuario
function limparCampos() {
    campoSelect.value = selecione;
    campoQuantidade.value = 1;
    campoPotencia.value = "";
    campoHoras.value = "";
    campoDias.value = "";
}
