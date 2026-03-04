import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Alert, StatusBar, SafeAreaView, Modal, Share, Linking, Clipboard,
  Image
} from 'react-native';
import CardapioCliente from './CardapioCliente';
// Importamos o AsyncStorage para salvar o login no celular
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
const BASE_URL = "https://marmitas-47af0-default-rtdb.firebaseio.com/";

export default function App() {
  const { width } = useWindowDimensions();
  // --- FUNÇÃO PARA COMPARTILHAR O LINK DO CARDÁPIO ---
  const compartilharLinkCardapio = async () => {
  try {
    const linkVercel = `https://SEU-PROJETO.vercel.app/${lojaID}`;

    const mensagem = `Olá! Confira nosso cardápio digital e faça seu pedido:\n${linkVercel}`;

    await Share.share({
      message: mensagem,
    });

  } catch (error) {
    Alert.alert("Erro", "Não foi possível compartilhar.");
  }
};
const isWeb = width > 768;
  // --- ESTADOS DE ACESSO E PERFIL ---
  const [estaLogado, setEstaLogado] = useState(false);
  const [telaAtual, setTelaAtual] = useState('LOGIN');
  const [menuAtivo, setMenuAtivo] = useState('menu'); // 'menu', 'categorias', 'cadastro', 'linguagem' 
  const [lojaID, setLojaID] = useState('');
useEffect(() => {
  if (
    typeof window !== 'undefined' &&
    window &&
    window.location &&
    window.location.pathname
  ) {
    const path = window.location.pathname.replace('/', '');

    if (path && path.length > 0) {
      setLojaID(path);
      setTelaAtual('CARDAPIO');
    }
  }
}, []);
  const [nomeRestaurante, setNomeRestaurante] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappLoja, setWhatsappLoja] = useState('');
  const [documento, setDocumento] = useState('');
  const [nomeProprietario, setNomeProprietario] = useState('');
  const [senha, setSenha] = useState(''); 
const escolherImagem = async (catId, itemId) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.5,
    base64: true
  });

  if (!result.canceled) {
    const uriBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;

    // Salva a imagem no Firebase dentro do item
    await fetch(
      `${BASE_URL}/${lojaID}/config/cardapio/${catId}/itens/${itemId}/imagem.json`,
      {
        method: 'PUT',
        body: JSON.stringify(uriBase64)
      }
);

    carregarDados();
    Alert.alert("Imagem adicionada!");
  }
};

  // --- ESTADOS DO PDV E PEDIDOS ---
  const [abaPrincipal, setAbaPrincipal] = useState('PDV');
  const [tipoServico, setTipoServico] = useState('Delivery'); 
  const [cliente, setCliente] = useState('');
  const [endereco, setEndereco] = useState('');
  const [comanda, setComanda] = useState('');
  const [observacao, setObservacao] = useState('');
  const [pagamento, setPagamento] = useState('Pix');
  const [prato, setPrato] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [sacola, setSacola] = useState([]);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState([]);
  const [descontoValor, setDescontoValor] = useState('');
  const [tipoDesconto, setTipoDesconto] = useState('fixo'); // 'fixo' ou 'porcentagem'
  const [pedidos, setPedidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  const [listaAdicionais, setListaAdicionais] = useState([]);
const [novoAdicionalNome, setNovoAdicionalNome] = useState('');
const [novoAdicionalValor, setNovoAdicionalValor] = useState('');
  const [modalConfig, setModalConfig] = useState(false);
const [verCardapioCliente, setVerCardapioCliente] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState(new Date().toISOString().split('T')[0]);
  const [filtroPedido, setFiltroPedido] = useState('Delivery');
const [busca, setBusca] = useState('');

  // --- ESTADOS DE CONFIGURAÇÃO DO CARDÁPIO ---
  const [novaCatNome, setNovaCatNome] = useState('');
  const [novoItemNome, setNovoItemNome] = useState('');
  const [precoPadrao, setPrecoPadrao] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [catSelecionadaID, setCatSelecionadaID] = useState('');
  const [precoP, setPrecoP] = useState('');
  const [precoM, setPrecoM] = useState('');
  const [precoG, setPrecoG] = useState('');
  const [tamanhoSel, setTamanhoSel] = useState('');
  // --- CONFIGURAÇÃO DE IDIOMA ---
  const [idioma, setIdioma] = useState('PT'); // PT ou EN
  const textos = {
    PT: {
      novaVenda: "NOVA VENDA",
      gerir: "GERIR PEDIDOS",
      cliente: "NOME DO CLIENTE",
      total: "TOTAL",
      finalizar: "ENVIAR PEDIDO",
      obs: "OBSERVAÇÕES",
      entrega: "DELIVERY",
      local: "LOCAL"
    },
    EN: {
      novaVenda: "NEW SALE",
      gerir: "MANAGE ORDERS",
      cliente: "CUSTOMER NAME",
      total: "TOTAL",
      finalizar: "SEND ORDER",
      obs: "OBSERVATIONS",
      entrega: "DELIVERY",
      local: "DINE-IN"
    }
  };

  // --- VERIFICAÇÃO INICIAL DE SESSÃO SALVA ---
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const dadosSalvos = await AsyncStorage.getItem('@dados_login');
        if (dadosSalvos) {
          const { id, nome, zap } = JSON.parse(dadosSalvos);
          setLojaID(id);
          setNomeRestaurante(nome);
          setWhatsappLoja(zap);
          setEstaLogado(true);
        }
      } catch (e) { console.log("Erro ao recuperar sessão", e); }
    };
    verificarSessao();
  }, []);

  const diasHist = [0, 1, 2, 3, 4, 5, 6].map(i => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const carregarDados = useCallback(async () => {
    if (!estaLogado) return;
    try {
      const resCat = await fetch(`${BASE_URL}/${lojaID}/config/cardapio.json`);
      const dataCat = await resCat.json();
      if (dataCat) {
        const formatado = Object.keys(dataCat).map(k => ({ id: k, ...dataCat[k] }));
        setCategorias(formatado);
        if (!catSelecionadaID && formatado.length > 0) setCatSelecionadaID(formatado[0].id);
      } else {
        setCategorias([]);
      }
      const resAdd = await fetch(`${BASE_URL}/${lojaID}/config/adicionais.json`);
const dataAdd = await resAdd.json();

if (dataAdd) {
  const formatados = Object.keys(dataAdd).map(k => ({
    id: k,
    ...dataAdd[k]
  }));
  setListaAdicionais(formatados);
} else {
  setListaAdicionais([]);
}
      const resPed = await fetch(`${BASE_URL}/${lojaID}/pedidos/${diaSelecionado}.json`);
      const dataPed = await resPed.json();
      if (dataPed) setPedidos(Object.keys(dataPed).map(k => ({ id: k, ...dataPed[k] })).reverse());
      else setPedidos([]);
    } catch (e) { console.log("Erro ao carregar:", e); }
  }, [lojaID, diaSelecionado, catSelecionadaID, estaLogado]);

useEffect(() => {
  if (!estaLogado) return;

  carregarDados();

  const intervalo = setInterval(() => {
    carregarDados();
  }, 3000);

  return () => clearInterval(intervalo);
}, [estaLogado, carregarDados]);


  // --- FUNÇÕES DE LOGIN/CADASTRO ---
  const realizarCadastro = async () => {
    if (!lojaID || !nomeRestaurante || !whatsappLoja || !senha) return Alert.alert("Erro", "Preencha todos os dados!");
    const perfil = { nomeRestaurante, email: email.toLowerCase(), whatsapp: whatsappLoja, documento, proprietario: nomeProprietario, senha };
    await fetch(`${BASE_URL}/${lojaID}/config/perfil.json`, { method: 'PUT', body: JSON.stringify(perfil) });
    Alert.alert("Sucesso", "Cadastro realizado! Faça login.");
    setTelaAtual('LOGIN');
  };
const compartilharMeuCardapio = async () => { try { `https://pedidofacilv3.vercel/?id=${lojaID}`; await Share.share({ message: `Confira nosso cardápio digital e faça seu pedido: ${linkVercel}`, }); } catch (error) { Alert.alert("Erro", "Não foi possível compartilhar o link."); } };
  const realizarLogin = async () => {
    if (!lojaID || !senha) return Alert.alert("Erro", "Preencha o ID e a Senha");
    const res = await fetch(`${BASE_URL}/${lojaID}/config/perfil.json`);
    const data = await res.json();
    if (data && data.senha === senha) {
      setNomeRestaurante(data.nomeRestaurante);
      setWhatsappLoja(data.whatsapp);
      await AsyncStorage.setItem('@dados_login', JSON.stringify({ id: lojaID, nome: data.nomeRestaurante, zap: data.whatsapp }));
      setEstaLogado(true);
    } else {
      Alert.alert("Erro", "ID ou Senha incorretos!");
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@dados_login');
    setEstaLogado(false);
  };

  // --- FUNÇÕES DE EDIÇÃO DO CARDÁPIO ---
  const addCategoria = async () => {
    if (!novaCatNome) return;
    await fetch(`${BASE_URL}/${lojaID}/config/cardapio.json`, { method: 'POST', body: JSON.stringify({ nome: novaCatNome, itens: {} }) });
    setNovaCatNome(''); carregarDados();
  };

  const apagarCategoria = async (id) => {
    Alert.alert("Atenção", "Deseja excluir esta categoria?", [
      { text: "Cancelar" },
      { text: "Excluir", onPress: async () => {
          await fetch(`${BASE_URL}/${lojaID}/config/cardapio/${id}.json`, { method: 'DELETE' });
          carregarDados();
      }}
    ]);
  };
const addAdicionalGlobal = async () => {
  if (!novoAdicionalNome || !novoAdicionalValor) {
    return Alert.alert("Erro", "Preencha nome e valor");
  }

  const valor = novoAdicionalValor.replace(',', '.');

  await fetch(`${BASE_URL}/${lojaID}/config/adicionais.json`, {
    method: 'POST',
    body: JSON.stringify({
      nome: novoAdicionalNome,
      valor: valor
    })
  });

  setNovoAdicionalNome('');
  setNovoAdicionalValor('');
  carregarDados();
};

const [adicionaisDoItem, setAdicionaisDoItem] = useState([]);
const toggleAdicionalItem = (adicional) => {
  const existe = adicionaisDoItem.find(a => a.id === adicional.id);

  if (existe) {
    setAdicionaisDoItem(adicionaisDoItem.filter(a => a.id !== adicional.id));
  } else {
    setAdicionaisDoItem([...adicionaisDoItem, adicional]);
  }
};
  const addItem = async () => {
    if (!catSelecionadaID || !novoItemNome) return Alert.alert("Erro", "Preencha o nome!");
    
    // Organiza os preços em um objeto
    const precos = {};
    if (precoP) precos.P = precoP.replace(',', '.');
    if (precoM) precos.M = precoM.replace(',', '.');
    if (precoG) precos.G = precoG.replace(',', '.');
    if (precoPadrao) precos.UNICO = precoPadrao.replace(',', '.');

    if (Object.keys(precos).length === 0) return Alert.alert("Erro", "Coloque ao menos um preço!");

    await fetch(`${BASE_URL}/${lojaID}/config/cardapio/${catSelecionadaID}/itens.json`, { 
      method: 'POST', 
      body: JSON.stringify({ 
  nome: novoItemNome,
  descricao: novaDescricao || "",
  precos: precos,
  adicionais: adicionaisDoItem.reduce((obj, add) => {
    obj[add.nome] = add.valor;
    return obj;
  }, {})
}) 
    });
    
    setNovoItemNome(''); setPrecoPadrao(''); setPrecoP(''); setPrecoM(''); setPrecoG('');
    carregarDados();
    setAdicionaisDoItem([]);
  };
  const apagarItem = async (catId, itemId) => {
    await fetch(`${BASE_URL}/${lojaID}/config/cardapio/${catId}/itens/${itemId}.json`, { method: 'DELETE' });
    carregarDados();
  };

  // --- OPERAÇÕES DE PEDIDOS ---
 const cancelarVenda = () => {
    Alert.alert(
      "Cancelar Lançamento",
      "Deseja limpar todos os dados deste pedido atual?",
      [
        { text: "Não", style: "cancel" },
        { 
          text: "Sim, Limpar", 
          style: "destructive", 
          onPress: () => {
            setSacola([]); setCliente(''); setEndereco('');
            setComanda(''); setObservacao(''); setPrato(null);
            Alert.alert("Sucesso", "Dados limpos!");
          } 
        }
      ]
    );
  };
const calcularTotalComDesconto = () => {
    const subtotal = sacola.reduce((a, b) => a + b.subtotal, 0);
    const desc = parseFloat(descontoValor.replace(',', '.')) || 0;
    
    if (tipoDesconto === 'fixo') {
      return Math.max(0, subtotal - desc);
    } else {
      return Math.max(0, subtotal - (subtotal * (desc / 100)));
    }
  };
  const finalizarPedido = async () => {

  // ===== MODO + ITENS (EDIÇÃO) =====
  if (pedidoEditando) {
    if (sacola.length === 0) {
      Alert.alert("Adicione itens na sacola primeiro");
      return;
    }

    const pedidoAtual = pedidos.find(p => p.id === pedidoEditando);
    if (!pedidoAtual) return;

    const novosItens = [...(pedidoAtual.itens || []), ...sacola];
    const novoTotal = novosItens.reduce((acc, item) => acc + item.subtotal, 0);

    await fetch(
      `${BASE_URL}/${lojaID}/pedidos/${diaSelecionado}/${pedidoEditando}.json`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          itens: novosItens,
          total: novoTotal
        })
      }
    );

    setSacola([]);
    setPedidoEditando(null);
    setAbaPrincipal('PEDIDOS');
    carregarDados();
    Alert.alert("Itens adicionados ao pedido");
    return;
  }

  // ===== NOVO PEDIDO NORMAL =====
  if (tipoServico === 'Delivery' && !cliente)
    return Alert.alert("Erro", "Nome do cliente é obrigatório para Delivery");

  if (sacola.length === 0)
    return Alert.alert("Erro", "A sacola está vazia!");
 
    // Se estiver adicionando itens em um pedido existente
if (pedidoEditando) {
  const pedidoAtual = pedidos.find(p => p.id === pedidoEditando);
  if (!pedidoAtual) return;

  const novosItens = [...(pedidoAtual.itens || []), ...sacola];
  const novoTotal = novosItens.reduce((acc, item) => acc + item.subtotal, 0);

  await fetch(
    `${BASE_URL}/${lojaID}/pedidos/${diaSelecionado}/${pedidoEditando}.json`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        itens: novosItens,
        total: novoTotal
      })
    }
  );

  setSacola([]);
  setPedidoEditando(null);
  setAbaPrincipal('PEDIDOS');
  carregarDados();
  Alert.alert("Itens adicionados ao pedido");
  return;
}
    
    // Se for Local e não tiver nome, define como "Mesa [X]"
    const nomeFinal = cliente || (tipoServico === 'Local' ? `Mesa ${comanda || 'S/N'}` : 'Cliente s/ nome');

    const pedido = {
      cliente: nomeFinal, 
      tipo: tipoServico, 
      pagamento, 
      itens: sacola,
      total: calcularTotalComDesconto(),
      endereco: tipoServico === 'Delivery' ? endereco : `Mesa/Pedido: ${comanda}`,
      obs: observacao, 
      hora: new Date().toLocaleTimeString().substring(0, 5),
      status: tipoServico === 'Delivery' ? 'Pendente' : 'Aberta'
    };
setDescontoValor('');
    await fetch(`${BASE_URL}/${lojaID}/pedidos/${diaSelecionado}.json`, { method: 'POST', body: JSON.stringify(pedido) });
    setSacola([]); setCliente(''); setEndereco(''); setComanda(''); setObservacao('');
    Alert.alert("Sucesso", "Pedido Enviado!"); carregarDados();
  };

  const atualizarStatus = async (id, novoStatus) => {
    await fetch(`${BASE_URL}/${lojaID}/pedidos/${diaSelecionado}/${id}/status.json`, { method: 'PUT', body: JSON.stringify(novoStatus) });
    carregarDados();
  };
  
const apagarPedido = async (id) => {
    Alert.alert(
      "Excluir Pedido",
      "Deseja apagar este pedido permanentemente?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: async () => {
            try {
              await fetch(`${BASE_URL}/${lojaID}/pedidos/${diaSelecionado}/${id}.json`, { 
                method: 'DELETE' 
              });
              carregarDados();
            } catch (e) {
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          } 
        }
      ]
    );
  };
  const adicionarItemAoPedido = async (pedidoId) => {
  if (sacola.length === 0) {
    Alert.alert("Adicione itens na sacola primeiro");
    return;
  }

  const pedido = pedidos.find(p => p.id === pedidoId);
  if (!pedido) return;

  const novosItens = [...(pedido.itens || []), ...sacola];

  const novoTotal = novosItens.reduce((acc, item) => acc + item.subtotal, 0);

  await fetch(
    `${BASE_URL}/${lojaID}/pedidos/${diaSelecionado}/${pedidoId}.json`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        itens: novosItens,
        total: novoTotal
      })
    }
  );

  setSacola([]);
  carregarDados();
  Alert.alert("Itens adicionados ao pedido");
};
  // --- INÍCIO DO BLOCO ATUALIZADO ---

const imprimirPedido = (p) => {
  const listaItens = p.itens.map(i => {
    let itemTexto = `${i.quantidade}x ${i.nome}`;
    if (i.adicionais && i.adicionais.length > 0) {
      const nomesAdds = i.adicionais.map(a => a.nome).join(', ');
      itemTexto += `\n   (+ Adicionais: ${nomesAdds})`;
    }
    return itemTexto;
  }).join('\n');

  const cupom =
    `=== ${nomeRestaurante} ===\n` +
    `CLIENTE: ${p.cliente}\n` +
    `TIPO: ${p.tipo}\n` +
    `ITENS:\n${listaItens}\n` +
    `--------------------------\n` +
    `TOTAL: R$ ${p.total.toFixed(2)}\n` +
    `${p.endereco ? `END: ${p.endereco}\n` : ''}` +
    `${p.obs ? `OBS: ${p.obs}` : ''}`;

  // Se estiver rodando no computador (web)
  if (typeof window !== 'undefined') {
    const conteudo = `
      <html>
        <body style="font-family: monospace; white-space: pre;">
${cupom}
        </body>
      </html>
    `;
    const janela = window.open('', '', 'width=300,height=600');
    janela.document.write(conteudo);
    janela.document.close();
    janela.print();
  } else {
    // Celular continua usando compartilhar
    Share.share({ message: cupom });
  }
  const copiarLinkCardapio = () => {
    const link = `https://seusite.com/cardapio?id=${lojaID}`; // Aqui será o link futuro
    Clipboard.setString(link);
    Alert.alert("Link Copiado!", "Envie este link para seus clientes acessarem o cardápio.");
  };
};const exportarRelatorioDia = () => {
  const totalDia = calcularFaturamentoDia();
  const pedidosDia = pedidos.filter(
    p => p.status === 'Pago' || p.status === 'Concluído'
  );

  let relatorio = `RELATÓRIO DE VENDAS\n`;
  relatorio += `Restaurante: ${nomeRestaurante}\n`;
  relatorio += `Data: ${diaSelecionado.split('-').reverse().join('/')}\n`;
  relatorio += `----------------------------\n\n`;

  pedidosDia.forEach(p => {
    relatorio += `${p.hora} - ${p.cliente}\n`;
    relatorio += `R$ ${p.total.toFixed(2)} (${p.pagamento})\n\n`;
  });

  relatorio += `----------------------------\n`;
  relatorio += `TOTAL: R$ ${totalDia.toFixed(2)}`;

  // WEB (computador)
  if (typeof window !== 'undefined') {
    const conteudo = `
      <html>
        <body style="font-family: monospace; white-space: pre;">
${relatorio}
        </body>
      </html>
    `;
    const janela = window.open('', '', 'width=400,height=600');
    janela.document.write(conteudo);
    janela.document.close();
    janela.print();
  } else {
    // Celular
    Share.share({ message: relatorio });
  }
};

const enviarZapConfirmado = (p) => {
  // Adicionando lógica de adicionais no texto do Zap
  const listaItens = p.itens.map(i => {
    let itemTexto = `• *${i.quantidade}x ${i.nome}*`;
    if (i.adicionais && i.adicionais.length > 0) {
      const nomesAdds = i.adicionais.map(a => a.nome).join(', ');
      itemTexto += `\n  └ _Adicionais: ${nomesAdds}_`;
    }
    return itemTexto;
  }).join('\n');

  const texto = `✅ *PEDIDO CONFIRMADO*\n\nOlá ${p.cliente}, recebemos seu pedido!\n\n*ITENS:*\n${listaItens}\n\n*TOTAL:* R$ ${p.total.toFixed(2)}\n*PAGAMENTO:* ${p.pagamento}\n*TIPO:* ${p.tipo}\n\nEstamos preparando com carinho! 🍱`;
  const numero = p.telefone?.replace(/\D/g, '') || '';
const url = `https://wa.me/55${numero}?text=${encodeURIComponent(texto)}`;
Linking.openURL(url);
};

const enviarZapPronto = (p) => {
  // Adicionando lógica de adicionais no texto do Zap Pronto também
  const listaItens = p.itens.map(i => {
    let itemTexto = `• *${i.quantidade}x ${i.nome}*`;
    if (i.adicionais && i.adicionais.length > 0) {
      const nomesAdds = i.adicionais.map(a => a.nome).join(', ');
      itemTexto += `\n  └ _Adicionais: ${nomesAdds}_`;
    }
    return itemTexto;
  }).join('\n');

  const texto = `🚀 *SEU PEDIDO ESTÁ PRONTO!*\n\nOlá ${p.cliente}, ótimas notícias! Seu pedido já está finalizado.\n\n*DETALHES:*\n${listaItens}\n\n*TOTAL:* R$ ${p.total.toFixed(2)}\n\n${p.tipo === 'Delivery' ? 'O motoboy já está saindo! 🛵' : 'Pode vir retirar ou já estamos levando à mesa! 🍽️'}`;
  const numero = p.telefone?.replace(/\D/g, '') || '';
const url = `https://wa.me/55${numero}?text=${encodeURIComponent(texto)}`;
Linking.openURL(url);
};
const enviarZapCaminho = (p) => {
  const listaItens = p.itens.map(i => {
    let itemTexto = `• *${i.quantidade}x ${i.nome}*`;
    if (i.adicionais && i.adicionais.length > 0) {
      const nomesAdds = i.adicionais.map(a => a.nome).join(', ');
      itemTexto += `\n  └ _Adicionais: ${nomesAdds}_`;
    }
    return itemTexto;
  }).join('\n');

  const texto = `🛵 *PEDIDO SAIU PARA ENTREGA!*

Olá ${p.cliente},
O motoboy já está a caminho!

*ITENS:*
${listaItens}

*TOTAL:* R$ ${p.total.toFixed(2)}

Em breve chegará até você.`;

  const numero = p.telefone?.replace(/\D/g, '') || '';
  const url = `https://wa.me/55${numero}?text=${encodeURIComponent(texto)}`;
  
  Linking.openURL(url);
};
const copiarEndereco = (endereco) => {
  if (!endereco || endereco.includes('Mesa/Pedido')) {
    Alert.alert("Aviso", "Este pedido não possui endereço de entrega.");
    return;
  }
  Clipboard.setString(endereco);
  Alert.alert("Sucesso", "Endereço copiado para a área de transferência!");
};

// --- FIM DO BLOCO ATUALIZADO ---
  // --- RENDERIZAÇÃO LOGIN ---
  if (!estaLogado) {
    return (
      <ScrollView
  contentContainerStyle={[
    styles.scrollContent,
    isWeb && styles.scrollContentWeb
  ]}
>
        <Text style={styles.loginEmoji}>🍱</Text>
        <Text style={styles.loginTitle}>{telaAtual === 'LOGIN' ? 'Painel do Lojista' : 'Cadastrar Restaurante'}</Text>
        <TextInput style={styles.loginInput} placeholder={telaAtual === 'LOGIN' ? "E-mail ou CPF/CNPJ" : "Crie um ID de acesso único"} value={lojaID} onChangeText={setLojaID} autoCapitalize="none" placeholderTextColor="#666" />
        {telaAtual === 'CADASTRO' && (
          <>
            <TextInput style={styles.loginInput} placeholder="Nome do Restaurante" value={nomeRestaurante} onChangeText={setNomeRestaurante} placeholderTextColor="#666" />
            <TextInput style={styles.loginInput} placeholder="Nome do Proprietário" value={nomeProprietario} onChangeText={setNomeProprietario} placeholderTextColor="#666" />
            <TextInput style={styles.loginInput} placeholder="WhatsApp" value={whatsappLoja} onChangeText={setWhatsappLoja} keyboardType="numeric" placeholderTextColor="#666" />
            <TextInput style={styles.loginInput} placeholder="CNPJ ou CPF" value={documento} onChangeText={setDocumento} placeholderTextColor="#666" />
            <TextInput style={styles.loginInput} placeholder="E-mail" value={email} onChangeText={setEmail} placeholderTextColor="#666" />
          </>
        )}
        <TextInput style={styles.loginInput} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry placeholderTextColor="#666" />
        <TouchableOpacity style={styles.loginBtn} onPress={telaAtual === 'LOGIN' ? realizarLogin : realizarCadastro}>
          <Text style={styles.whiteBold}>{telaAtual === 'LOGIN' ? 'ENTRAR' : 'FINALIZAR CADASTRO'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTelaAtual(telaAtual === 'LOGIN' ? 'CADASTRO' : 'LOGIN')}>
          <Text style={styles.link}>{telaAtual === 'LOGIN' ? 'Não tem conta? Cadastre-se' : 'Já sou cadastrado'}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
  // --- FUNÇÃO PARA CALCULAR O FATURAMENTO ---
  const calcularFaturamentoDia = () => {
    return pedidos
      .filter(p => p.status === 'Pago' || p.status === 'Concluído')
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
  };
if (telaAtual === 'CARDAPIO') {
  return (
    <CardapioCliente 
      lojaID={lojaID} 
      whatsappLoja={whatsappLoja} 
    />
  );
}
  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <TouchableOpacity style={[styles.abaBtn, abaPrincipal === 'PDV' && styles.abaAtiva]} onPress={() => setAbaPrincipal('PDV')}>
          <Text style={styles.abaTxt}>NOVA VENDA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.abaBtn, abaPrincipal === 'PEDIDOS' && styles.abaAtiva]} onPress={() => {setAbaPrincipal('PEDIDOS'); setDiaSelecionado(new Date().toISOString().split('T')[0]);}}>
          <Text style={styles.abaTxt}>GERIR HOJE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.abaBtn, abaPrincipal === 'FINANCEIRO' && styles.abaAtiva]} onPress={() => setAbaPrincipal('FINANCEIRO')}>
          <Text style={styles.abaTxt}>FINANCEIRO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.abaBtn, {backgroundColor: '#27ae60'}]} onPress={() => setVerCardapioCliente(true)}>
          <Text style={styles.abaTxt}>📱 MEU CARDÁPIO</Text>
        </TouchableOpacity>
      </View>
<TouchableOpacity 
          style={[styles.abaBtn, {backgroundColor: '#3498db'}]} 
          onPress={compartilharLinkCardapio}
        >
          <Text style={styles.abaTxt}>📤 ENVIAR LINK</Text>
        </TouchableOpacity>
      {abaPrincipal === 'PDV' ? (
        <ScrollView style={styles.p15}>
          <View style={styles.card}>
            <Text style={styles.label}>TIPO DE SERVIÇO</Text>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.tipoBtn, tipoServico === 'Delivery' && styles.bgPreto]} onPress={() => setTipoServico('Delivery')}><Text style={tipoServico === 'Delivery' && styles.white}>🛵 DELIVERY</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tipoBtn, tipoServico === 'Local' && styles.bgPreto]} onPress={() => setTipoServico('Local')}><Text style={tipoServico === 'Local' && styles.white}>🍽️ LOCAL</Text></TouchableOpacity>
            </View>
           <TextInput 
  style={styles.input} 
  placeholder={tipoServico === 'Local' ? "NOME (OPCIONAL)" : "NOME DO CLIENTE"} 
  value={cliente} 
  onChangeText={setCliente} 
  placeholderTextColor="#333" 
/>

{tipoServico === 'Delivery' ? (
  <View>
    <TextInput style={styles.input} placeholder="ENDEREÇO COMPLETO" value={endereco} onChangeText={setEndereco} placeholderTextColor="#333" />
    <View style={styles.row}>{['Pix', 'Dinheiro', 'Cartão'].map(p => (
      <TouchableOpacity key={p} style={[styles.tipoBtn, pagamento === p && styles.bgPreto]} onPress={() => setPagamento(p)}><Text style={pagamento === p && styles.white}>{p.toUpperCase()}</Text></TouchableOpacity>
    ))}</View>
  </View>
) : (
  <TextInput 
    style={styles.input} 
    placeholder="Nº DA MESA OU PEDIDO" 
    value={comanda} 
    onChangeText={setComanda} 
    keyboardType="numeric" 
    placeholderTextColor="#333" 
  />
)}
{/* CAMPO DE OBSERVAÇÃO */}
<Text style={[styles.label, { marginTop: 15 }]}>OBSERVAÇÕES:</Text>
<TextInput 
  style={[styles.input, { height: 60, textAlignVertical: 'top' }]} 
  placeholder="EX: SEM CEBOLA, CAPRICHA NO MOLHO..." 
  value={observacao} 
  onChangeText={setObservacao} 
  multiline={true}
  placeholderTextColor="#666" 
/>
{categorias.map(cat => (
            <View key={cat.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 5 }}>
                <Text style={styles.catTitulo}>{cat.nome ? cat.nome.toUpperCase() : "SEM CATEGORIA"}</Text>
                
                <TouchableOpacity 
                  style={{ padding: 5, marginRight: 10 }}
                  onPress={() => {
                    Alert.prompt("Editar Categoria", "Novo nome da categoria:", [
                      { text: "Cancelar" },
                      { text: "Salvar", onPress: (txt) => {
                        if(txt) setCategorias(categorias.map(c => c.id === cat.id ? {...c, nome: txt} : c))
                      }}
                    ], "plain-text", cat.nome)
                  }}
                >
                  <Text style={{ fontSize: 16 }}>⚙️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.grid}>
                {cat.itens && Object.keys(cat.itens).map(key => (
                  <TouchableOpacity 
                    key={key} 
                    style={[styles.itemCard, prato?.nome === cat.itens[key].nome && styles.bgPreto]} 
                    onPress={() => { 
  setPrato({
  ...cat.itens[key],
  adicionais: cat.itens[key].adicionais || {}
});
  setQuantidade(1);
  setAdicionaisSelecionados([]);
}}
                    onLongPress={() => {
                      // MENU DE EDIÇÃO COMPLETA
                      Alert.alert("Gerenciar: " + cat.itens[key].nome, "O que deseja alterar?", [
                        { text: "Cancelar", style: 'cancel' },
                        { text: "Excluir Item", style: 'destructive', onPress: () => {
                            const novas = [...categorias];
                            const idx = novas.findIndex(c => c.id === cat.id);
                            delete novas[idx].itens[key];
                            setCategorias(novas);
                        }},
                        { text: "Nome e Preço", onPress: () => {
                            // 1º Passo: Mudar Nome
                            Alert.prompt("Passo 1: Nome", "Digite o novo nome:", [
                              { text: "Cancelar" },
                              { text: "Próximo", onPress: (novoNome) => {
                                  if(!novoNome) return;
                                  
                                  // 2º Passo: Mudar Preço (Se for UNICO)
                                  if(cat.itens[key].precos.UNICO) {
                                    Alert.prompt("Passo 2: Preço", "Digite o novo valor (Ex: 25.50):", [
                                      { text: "Salvar", onPress: (novoPreco) => {
                                          const novas = [...categorias];
                                          const idx = novas.findIndex(c => c.id === cat.id);
                                          novas[idx].itens[key].nome = novoNome;
                                          novas[idx].itens[key].precos.UNICO = novoPreco.replace(',', '.');
                                          setCategorias(novas);
                                          Alert.alert("Sucesso", "Item atualizado!");
                                      }}
                                    ], "plain-text", cat.itens[key].precos.UNICO.toString());
                                  } else {
                                    // Se tiver tamanhos (P, M, G), ele avisa que precisa editar no código ou criamos um menu maior
                                    Alert.alert("Aviso", "Este item tem vários tamanhos. O nome foi alterado, mas para preços variados é necessário o menu avançado.");
                                    const novas = [...categorias];
                                    const idx = novas.findIndex(c => c.id === cat.id);
                                    novas[idx].itens[key].nome = novoNome;
                                    setCategorias(novas);
                                  }
                              }}
                            ], "plain-text", cat.itens[key].nome);
                        }}
                      ]);
                    }}
                  >
                    <View style={{ alignItems: 'center' }}>

  {cat.itens[key].imagem ? (
    <Image
      source={{ uri: cat.itens[key].imagem }}
      style={{ width: 70, height: 70, borderRadius: 10, marginBottom: 5 }}
    />
  ) : null}
<TouchableOpacity
  onPress={() => escolherImagem(cat.id, key)}
>
  <Text style={{ fontSize: 10, color: '#2980B9' }}>
    📷 Adicionar foto
  </Text>
</TouchableOpacity>
  <Text style={[styles.itemTxt, prato?.nome === cat.itens[key].nome && styles.white]}>
    {cat.itens[key].nome}
  </Text>

</View>
                  </TouchableOpacity>
             ))}
              </View>
            </View>
          ))} 

          {/* O código do prato (modal) começa logo abaixo do fechamento acima */}
          {prato && (
  <View style={styles.boxAdd}>

    <Text style={[styles.bold, {fontSize: 18}]}>{prato.nome}</Text>

{prato.descricao ? (
  <Text style={{ color: '#666', marginBottom: 10 }}>
    {prato.descricao}
  </Text>
) : null}

    {/* Trava de segurança: só renderiza se existir o objeto e se ele tiver chaves (itens) */}
    {prato.adicionais && Object.keys(prato.adicionais).length > 0 ? (
      <>
        <Text style={styles.label}>ADICIONAIS:</Text>
        <View style={styles.grid}>
          {Object.keys(prato.adicionais).map((nome) => {
            const selecionado = adicionaisSelecionados.find(a => a.nome === nome);

            return (
              <TouchableOpacity
                key={nome}
                style={[
                  styles.tipoBtn,
                  {minWidth: '45%'},
                  selecionado && styles.bgPreto
                ]}
                onPress={() => {
                  if (selecionado) {
                    setAdicionaisSelecionados(
                      adicionaisSelecionados.filter(a => a.nome !== nome)
                    );
                  } else {
                    setAdicionaisSelecionados([
                      ...adicionaisSelecionados,
                      { nome, valor: prato.adicionais[nome] }
                    ]);
                  }
                }}
              >
                <Text style={selecionado && styles.white}>
                  {nome} (+R$ {parseFloat(prato.adicionais[nome]).toFixed(2)})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </>
    ) : null}
                {/* Só mostra o texto e os botões se NÃO for UNICO */}
{!(prato.precos && prato.precos.UNICO && Object.keys(prato.precos).length === 1) && (
  <>
    <Text style={styles.label}>ESCOLHA O TAMANHO:</Text>
    <View style={styles.grid}>
      {prato.precos && Object.keys(prato.precos).map(t => (
        <TouchableOpacity 
          key={t} 
          style={[styles.tipoBtn, {minWidth: '45%'}, tamanhoSel === t && styles.bgPreto]} 
          onPress={() => setTamanhoSel(t)}
        >
          <Text style={tamanhoSel === t && styles.white}>{t} (R$ {prato.precos[t]})</Text>
        </TouchableOpacity>
      ))}
    </View>
  </>
)}

                <View style={[styles.row, {marginTop: 15, justifyContent: 'center'}]}>
                    <TouchableOpacity onPress={() => setQuantidade(Math.max(1, quantidade - 1))} style={styles.qtdBtn}><Text style={styles.whiteBold}>-</Text></TouchableOpacity>
                    <Text style={[styles.bold, {marginHorizontal: 20, fontSize: 18}]}>{quantidade}</Text>
                    <TouchableOpacity onPress={() => setQuantidade(quantidade + 1)} style={styles.qtdBtn}><Text style={styles.whiteBold}>+</Text></TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.btnVerde} 
                  onPress={() => { 
                    // Se não tiver tamanho e não for UNICO, aí sim dá erro
                    if(!tamanhoSel && !(prato.precos && prato.precos.UNICO)) {
                      return Alert.alert("Erro", "Selecione um tamanho!");
                    }

                    // Define qual tamanho usar: o selecionado ou o UNICO
                    const tamFinal = tamanhoSel || 'UNICO';
                    const valorBase = parseFloat(prato.precos[tamFinal]);

const valorAdicionais = adicionaisSelecionados.reduce(
  (acc, a) => acc + parseFloat(a.valor),
  0
);

const valorUnitario = valorBase + valorAdicionais;
                    
                    setSacola([
  ...sacola, 
  { 
    id: Date.now().toString(), 
    nome: tamFinal === 'UNICO' ? prato.nome : `${prato.nome} (${tamFinal})`, 
    quantidade: quantidade, 
    valorUnitario: valorUnitario,
    subtotal: valorUnitario * quantidade,
    adicionais: adicionaisSelecionados
  }
]);

                    // Reseta tudo para o próximo item
                    setPrato(null); 
                    setTamanhoSel('');
                    setQuantidade(1);
                  }}
                >
                  <Text style={styles.whiteBold}>
                    {tamanhoSel === 'UNICO' || (prato.precos && prato.precos.UNICO) ? 'ADICIONAR À SACOLA' : 'CONFIRMAR E ADICIONAR'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => {setPrato(null); setTamanhoSel('');}} style={{marginTop: 10}}>
                  <Text style={{textAlign: 'center', color: 'red'}}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View> 

       {/* --- INÍCIO DA SACOLA CORRIGIDA --- */}
{sacola.length > 0 && (
  <View style={styles.sacola}>
    <Text style={[styles.bold, { fontSize: 18, marginBottom: 10 }]}>🛒 ITENS NA SACOLA:</Text>
    
    {sacola.map((item) => (
      <View key={item.id} style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 }}>
        <View style={styles.row}>
          <Text style={{ fontWeight: 'bold', flex: 1, fontSize: 16 }}>{item.quantidade}x {item.nome}</Text>
          <Text style={{ fontWeight: 'bold' }}>R$ {item.subtotal.toFixed(2)}</Text>
        </View>
        
        {/* Aqui é onde os adicionais aparecem na tela */}
        {item.adicionais && item.adicionais.length > 0 && item.adicionais.map((add, idx) => (
          <Text key={idx} style={{ fontSize: 13, color: '#666', marginLeft: 15, fontStyle: 'italic' }}>
            + {add.nome} (R$ {parseFloat(add.valor).toFixed(2)})
          </Text>
        ))}
      </View>
    ))}

    <View style={{ marginTop: 10, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8 }}>
      <Text style={[styles.bold, { fontSize: 14, marginBottom: 5 }]}>DESCONTO:</Text>
      <View style={styles.row}>
        <TextInput 
          style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10 }]} 
          placeholder="Valor" 
          keyboardType="numeric"
          value={descontoValor}
          onChangeText={setDescontoValor}
        />
        <TouchableOpacity 
          style={[styles.tipoBtn, tipoDesconto === 'fixo' && styles.bgPreto]} 
          onPress={() => setTipoDesconto('fixo')}
        >
          <Text style={tipoDesconto === 'fixo' && styles.white}>R$</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tipoBtn, tipoDesconto === 'porcentagem' && styles.bgPreto]} 
          onPress={() => setTipoDesconto('porcentagem')}
        >
          <Text style={tipoDesconto === 'porcentagem' && styles.white}>%</Text>
        </TouchableOpacity>
      </View>
    </View>

    <Text style={[styles.bold, { fontSize: 22, marginVertical: 15, color: '#27AE60', textAlign: 'right' }]}>
      TOTAL: R$ {calcularTotalComDesconto().toFixed(2)}
    </Text>
    
    <TouchableOpacity style={styles.btnVerde} onPress={finalizarPedido}>
      <Text style={styles.whiteBold}>ENVIAR PEDIDO</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={[styles.btnAcao, { borderColor: 'red', marginTop: 10, alignItems: 'center' }]} 
      onPress={cancelarVenda}
    >
      <Text style={{ color: 'red', fontWeight: 'bold' }}>CANCELAR / LIMPAR</Text>
    </TouchableOpacity>
  </View>
)}
{/* --- FIM DA SACOLA CORRIGIDA --- */}
        </ScrollView>
      
      
) : abaPrincipal === 'PEDIDOS' ? (
        <View style={{flex: 1}}>
          {/* BARRA DE BUSCA */}
          <View style={{padding: 15, paddingBottom: 0}}>
            <TextInput 
              style={[styles.input, {backgroundColor: '#eee', borderWidth: 0, height: 45}]} 
              placeholder={filtroPedido === 'Delivery' ? "🔍 Buscar nome do cliente..." : "🔍 Buscar nome ou mesa..."}
              value={busca}
              onChangeText={setBusca}
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.filtroContainer}>
            <TouchableOpacity style={[styles.filtroBtn, filtroPedido === 'Delivery' && styles.filtroAtivo]} onPress={() => {setFiltroPedido('Delivery'); setBusca('');}}><Text style={filtroPedido === 'Delivery' && styles.white}>🛵 DELIVERY</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.filtroBtn, filtroPedido === 'Local' && styles.filtroAtivo]} onPress={() => {setFiltroPedido('Local'); setBusca('');}}><Text style={filtroPedido === 'Local' && styles.white}>🍽️ LOCAL</Text></TouchableOpacity>
          </View>

          <ScrollView style={styles.p15}>
            {/* --- SEÇÃO 1: PENDENTES / EM ANDAMENTO --- */}
            <Text style={{fontWeight: 'bold', color: '#E67E22', marginBottom: 10, fontSize: 12}}>⏳ PENDENTES ({pedidos.filter(p => p.tipo === filtroPedido && p.status !== 'Pago' && p.status !== 'Concluído').length})</Text>
            {pedidos
              .filter(p => p.tipo === filtroPedido && p.status !== 'Pago' && p.status !== 'Concluído')
.filter(p => (p.cliente?.toLowerCase().includes(busca.toLowerCase()) || p.comanda?.toString().includes(busca)))
.map(p => (
  <View key={p.id} style={styles.pedCard}>
    <Text style={styles.bold}>
    <Text style={{fontSize: 11, color: '#666'}}>
  Status: {p.status || 'Novo'}
</Text>
      
  {p.hora} - {p.cliente} {p.comanda ? `(Mesa ${p.comanda})` : ''}
</Text>

<Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000', marginTop: 2 }}>
  Total: R$ {Number(p.total || 0).toFixed(2)}
</Text>
    {/* Itens */}
    <Text>{p.itens?.map(i => `${i.quantidade}x ${i.nome}`).join(', ')}</Text>

{p.obs ? (
  <View style={styles.obsContainer}>
    <Text style={styles.obsIcon}>⚠️</Text>
    <Text style={styles.obsPedido}>{p.obs}</Text>
  </View>
) : null}

    <View style={styles.rowWrap}>
      {p.tipo === 'Delivery' ? (
                      <>
                      <TouchableOpacity
  style={styles.botaoImprimir}
  onPress={() => imprimirPedido(p)}
>
  <Text style={styles.botaoTexto}>Imprimir</Text>
</TouchableOpacity><TouchableOpacity
  style={[styles.btnAcao, { borderColor: '#000' }]}
  onPress={() => {
  setPedidoEditando(p.id);
  setAbaPrincipal('PDV');
}}
>
  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
    + ITENS
  </Text>
</TouchableOpacity>
                        <TouchableOpacity style={[styles.btnAcao, {borderColor: '#27AE60'}]} onPress={() => enviarZapConfirmado(p)}><Text style={{color: '#27AE60', fontSize: 10, fontWeight: 'bold'}}>CONFIRMAR ✅</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.btnAcao, {borderColor: '#2980B9'}]} onPress={() => {
  enviarZapCaminho(p);
  atualizarStatus(p.id, 'Saiu para entrega');
}}><Text style={{color: '#2980B9', fontSize: 10, fontWeight: 'bold'}}>SAIU ENTREGA 🛵</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.btnAcao} onPress={() => copiarEndereco(p.endereco)}><Text>📋 ENDEREÇO</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.btnAcao, {backgroundColor: '#27AE60'}]} onPress={() => atualizarStatus(p.id, 'Pago')}><Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>MARCAR ENTREGUE</Text></TouchableOpacity>
                      </>
                    ) : (
                      <>
                    
  <TouchableOpacity
    style={[styles.btnAcao, { borderColor: '#000' }]}
    onPress={() => {
      setPedidoEditando(p.id);
      setAbaPrincipal('PDV');
    }}
  >
    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
      + ITENS
    </Text>
  </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnAcao, {borderColor: '#27AE60'}]} onPress={() => atualizarStatus(p.id, 'Pago')}><Text style={{color: '#27AE60', fontWeight: 'bold'}}>MARCAR PAGO 💰</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.btnAcao} onPress={() => imprimirPedido(p)}><Text>🖨️ IMPRIMIR</Text></TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}

            {/* --- SEÇÃO 2: CONCLUÍDOS / PAGOS --- */}
            <View style={{marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ddd'}}>
              <Text style={{fontWeight: 'bold', color: '#27AE60', marginBottom: 10, fontSize: 12}}>✅ CONCLUÍDOS ({pedidos.filter(p => p.tipo === filtroPedido && (p.status === 'Pago' || p.status === 'Concluído')).length})</Text>
            </View>
            {pedidos
              .filter(p => p.tipo === filtroPedido && (p.status === 'Pago' || p.status === 'Concluído'))
              .filter(p => (p.cliente?.toLowerCase().includes(busca.toLowerCase()) || p.comanda?.toString().includes(busca)))
              .map(p => (
                <View key={p.id} style={[styles.pedCard, {opacity: 0.6, borderLeftColor: '#27AE60'}]}>
                  <Text style={styles.bold}>
  {p.hora} - {p.cliente} (FINALIZADO)
</Text>

<Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000', marginTop: 2 }}>
  Total: R$ {Number(p.total || 0).toFixed(2)}
</Text>
                  <View style={styles.rowWrap}>
                    <TouchableOpacity style={styles.btnAcao} onPress={() => atualizarStatus(p.id, 'Aberto')}><Text style={{fontSize: 10}}>REABRIR</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.btnAcao} onPress={() => imprimirPedido(p)}><Text>🖨️</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.btnAcao, {borderColor: 'red'}]} onPress={() => apagarPedido(p.id)}><Text>🗑️</Text></TouchableOpacity>
                  </View>
                </View>
              ))}
          </ScrollView>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.storiesWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {diasHist.map(d => (
                <TouchableOpacity 
                  key={d} 
                  style={[styles.storyCircle, diaSelecionado === d && styles.storyCircleActive]} 
                  onPress={() => setDiaSelecionado(d)}
                >
                  <Text style={diaSelecionado === d && styles.whiteBold}>{d.split('-')[2]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.faturamentoCard}>
  <View>
    <Text style={styles.faturamentoLabel}>FATURAMENTO EM {diaSelecionado.split('-').reverse().join('/')}</Text>
    <Text style={styles.faturamentoValor}>R$ {calcularFaturamentoDia().toFixed(2)}</Text>
    <TouchableOpacity 
  style={{ backgroundColor: '#27AE60', padding: 8, borderRadius: 5, marginTop: 10, alignItems: 'center' }} 
  onPress={exportarRelatorioDia}
>
  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>📥 EXPORTAR RELATÓRIO DO DIA</Text>
</TouchableOpacity>
  </View>
  <View style={styles.faturamentoBadge}>
    <Text style={{fontSize: 20}}>💰</Text>
  </View>
</View>
          <View style={styles.filtroContainer}>
            <TouchableOpacity style={[styles.filtroBtn, filtroPedido === 'Delivery' && styles.filtroAtivo]} onPress={() => setFiltroPedido('Delivery')}><Text style={filtroPedido === 'Delivery' && styles.white}>🛵 DELIVERY</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.filtroBtn, filtroPedido === 'Local' && styles.filtroAtivo]} onPress={() => setFiltroPedido('Local')}><Text style={filtroPedido === 'Local' && styles.white}>🍽️ LOCAL</Text></TouchableOpacity>
          </View>

          <ScrollView style={styles.p15}>
            {pedidos.filter(p => p.tipo === filtroPedido).map(p => (
              <View key={p.id} style={[styles.pedCard, p.status === 'Pago' && { borderLeftColor: '#27AE60' }]}>
                <Text style={styles.bold}>{p.hora} - {p.cliente} [{p.status?.toUpperCase() || 'ABERTA'}]</Text>
                <Text>{p.itens ? p.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ') : ""}</Text>
                {/* EXIBIÇÃO DA OBSERVAÇÃO NO CARD DO GESTOR */}
{p.obs ? (
  <View style={{ backgroundColor: '#FFF9C4', padding: 10, borderRadius: 5, marginTop: 8, borderLeftWidth: 4, borderLeftColor: '#F1C40F' }}>
    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13 }}>
      ⚠️ OBSERVAÇÃO: {p.obs}
    </Text>
  </View>
) : null}
                {p.tipo === 'Delivery' && (
                  <TouchableOpacity 
                    style={[styles.btnAcao, { backgroundColor: '#F0F0F0', marginTop: 10, flexDirection: 'row', alignItems: 'center' }]} 
                    onPress={() => copiarEndereco(p.endereco)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>📋 COPIAR ENDEREÇO</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.rowWrap}>
                  {p.tipo === 'Delivery' ? (
                    <>
                      <TouchableOpacity style={styles.btnAcao} onPress={() => atualizarStatus(p.id, 'Concluído')}>
                        <Text style={{ fontWeight: 'bold' }}>CONCLUIR</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.btnAcao, { borderColor: '#27AE60' }]} onPress={() => enviarZapConfirmado(p)}>
                        <Text style={{ color: '#27AE60', fontSize: 11, fontWeight: 'bold' }}>CONFIRMAR ✅</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.btnAcao, { borderColor: '#2980B9' }]} onPress={() => enviarZapPronto(p)}>
                        <Text style={{ color: '#2980B9', fontSize: 11, fontWeight: 'bold' }}>PRONTO 🚀</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.btnAcao, { backgroundColor: p.status === 'Pago' ? '#27AE60' : '#FFF', borderColor: '#27AE60' }]} 
                      onPress={() => atualizarStatus(p.id, p.status === 'Pago' ? 'Aberta' : 'Pago')}
                    >
                      <Text style={{ color: p.status === 'Pago' ? '#FFF' : '#27AE60', fontWeight: 'bold', fontSize: 11 }}>
                        {p.status === 'Pago' ? '✅ PAGO' : '💰 MARCAR PAGO'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.btnAcao} onPress={() => imprimirPedido(p)}><Text>🖨️</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.btnAcao, { borderColor: '#C0392B' }]} onPress={() => apagarPedido(p.id)}><Text>🗑️</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* BOTÃO FLUTUANTE DE CONFIG */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalConfig(true)}><Text>⚙️</Text></TouchableOpacity>
      
      {/* MODAL DE GERENCIAMENTO */}
      {/* MODAL DE GERENCIAMENTO COM MENU SLIDE */}
      <Modal visible={modalConfig} animationType="slide">
        <SafeAreaView style={{flex: 1, backgroundColor: '#FFF'}}>
          <View style={[styles.header, {backgroundColor: '#000', padding: 15, justifyContent: 'space-between', alignItems: 'center'}]}>
             <Text style={{color: '#FFF', fontWeight: 'bold', fontSize: 18}}>CONFIGURAÇÕES</Text>
             <TouchableOpacity 
               onPress={() => {setModalConfig(false); setMenuAtivo('menu');}}
               style={{ paddingHorizontal: 15, paddingVertical: 5 }} // Aumenta a área de clique
             >
                <Text style={{color: '#FF4444', fontWeight: 'bold', fontSize: 16}}>FECHAR</Text>
             </TouchableOpacity>
          </View>

          <ScrollView style={styles.p15}>
            
            {/* TELA 1: MENU PRINCIPAL (SLIDE BAR) */}
            {menuAtivo === 'menu' && (
              <View style={{marginTop: 10}}>
                <TouchableOpacity style={styles.menuItem} onPress={() => setMenuAtivo('categorias')}>
                  <Text style={styles.menuItemTxt}>📂 Categorias e Itens</Text>
                  <Text style={styles.menuItemSub}>Gerenciar pratos, bebidas e preços</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => setMenuAtivo('cadastro')}>
                  <Text style={styles.menuItemTxt}>👤 Alterar Cadastro</Text>
                  <Text style={styles.menuItemSub}>Ver informações do restaurante</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => setMenuAtivo('linguagem')}>
                  <Text style={styles.menuItemTxt}>🌐 Linguagem</Text>
                  <Text style={styles.menuItemSub}>Idioma do sistema (PT-BR)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.loginBtn, {backgroundColor: '#C0392B', marginTop: 40}]} onPress={logout}>
                  <Text style={styles.whiteBold}>SAIR DO SISTEMA</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* BOTÃO VOLTAR (Aparece em sub-telas) */}
            {menuAtivo !== 'menu' && (
              <TouchableOpacity onPress={() => setMenuAtivo('menu')} style={{marginBottom: 20, flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{color: '#27AE60', fontWeight: 'bold', fontSize: 16}}>← VOLTAR AO MENU</Text>
              </TouchableOpacity>
            )}

            {/* TELA 2: CATEGORIAS E ITENS (Seu código original aqui dentro) */}
            {menuAtivo === 'categorias' && (
              <View>
                <Text style={styles.labelConfig}>1. CATEGORIAS</Text>
                <View style={styles.row}>
                   <TextInput style={[styles.inputConfig, {flex: 1, marginRight: 10}]} placeholder="Nova Categoria" value={novaCatNome} onChangeText={setNovaCatNome} placeholderTextColor="#666" />
                   <TouchableOpacity style={[styles.btnVerde, {marginTop: 0, padding: 14}]} onPress={addCategoria}><Text style={styles.whiteBold}>+</Text></TouchableOpacity>
                </View>

                {categorias.map(c => (
                  <View key={c.id} style={styles.itemListaGerir}>
                    <Text style={styles.bold}>{c.nome ? c.nome.toUpperCase() : "SEM NOME"}</Text>
                    <TouchableOpacity onPress={() => apagarCategoria(c.id)}><Text>🗑️</Text></TouchableOpacity>
                  </View>
                ))}
<Text style={styles.labelConfig}>ADICIONAIS (EXTRAS)</Text>

<TextInput
  style={styles.inputConfig}
  placeholder="Nome do adicional (ex: Bacon)"
  value={novoAdicionalNome}
  onChangeText={setNovoAdicionalNome}
  placeholderTextColor="#666"
/>

<TextInput
  style={styles.inputConfig}
  placeholder="Valor (ex: 3.00)"
  value={novoAdicionalValor}
  onChangeText={setNovoAdicionalValor}
  keyboardType="numeric"
  placeholderTextColor="#666"
/>

<TouchableOpacity style={styles.btnVerde} onPress={addAdicionalGlobal}>
  <Text style={styles.whiteBold}>SALVAR ADICIONAL</Text>
</TouchableOpacity>

{listaAdicionais.map(add => (
  <View key={add.id} style={styles.itemListaGerir}>
    <Text>
      {add.nome} - R$ {parseFloat(add.valor).toFixed(2)}
    </Text>
  </View>
))}
                <View style={styles.divisor} />

                <Text style={styles.labelConfig}>2. ADICIONAR ITEM</Text>
                <Text style={styles.label}>SELECIONE A CATEGORIA:</Text>
                <ScrollView horizontal style={{marginBottom: 10}}>
                  {categorias.map(c => (
                    <TouchableOpacity key={c.id} style={[styles.filtroBtn, catSelecionadaID === c.id && styles.filtroAtivo]} onPress={() => setCatSelecionadaID(c.id)}>
                      <Text style={catSelecionadaID === c.id && styles.white}>{c.nome || "Cat"}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TextInput style={styles.inputConfig} placeholder="Nome do Item" value={novoItemNome} onChangeText={setNovoItemNome} placeholderTextColor="#666" />
                <TextInput
  style={styles.input}
  placeholder="Descrição (opcional)"
  value={novaDescricao}
  onChangeText={setNovaDescricao}
  multiline
  placeholderTextColor="#666"
/>
                <Text style={styles.label}>PREÇOS POR TAMANHO (OPCIONAL):</Text>
                <View style={styles.row}>
                  <TextInput style={[styles.inputConfig, {flex: 1, marginRight: 5}]} placeholder="P" value={precoP} onChangeText={setPrecoP} keyboardType="numeric" placeholderTextColor="#666" />
                  <TextInput style={[styles.inputConfig, {flex: 1, marginRight: 5}]} placeholder="M" value={precoM} onChangeText={setPrecoM} keyboardType="numeric" placeholderTextColor="#666" />
                  <TextInput style={[styles.inputConfig, {flex: 1}]} placeholder="G" value={precoG} onChangeText={setPrecoG} keyboardType="numeric" placeholderTextColor="#666" />
                </View>
                <TextInput style={styles.inputConfig} placeholder="Preço Único" value={precoPadrao} onChangeText={setPrecoPadrao} keyboardType="numeric" placeholderTextColor="#666" />
                <Text style={styles.label}>ADICIONAIS PARA ESTE ITEM:</Text>

{listaAdicionais.map(add => {
  const selecionado = adicionaisDoItem.find(a => a.id === add.id);

  return (
    <TouchableOpacity
      key={add.id}
      style={[
        styles.tipoBtn,
        { marginBottom: 5 },
        selecionado && styles.bgPreto
      ]}
      onPress={() => toggleAdicionalItem(add)}
    >
      <Text style={selecionado && styles.white}>
        {add.nome} (+R$ {parseFloat(add.valor).toFixed(2)})
      </Text>
    </TouchableOpacity>
  );
})}
                <TouchableOpacity style={styles.btnVerde} onPress={addItem}><Text style={styles.whiteBold}>SALVAR ITEM</Text></TouchableOpacity>

                <View style={styles.divisor} />
                
                <Text style={styles.labelConfig}>3. ITENS CADASTRADOS</Text>
                {categorias.map(c => (
                  <View key={c.id} style={{marginBottom: 15}}>
                    <Text style={[styles.bold, {color: '#E67E22'}]}>{c.nome || "S/ Cat"}</Text>
                    {c.itens && Object.keys(c.itens).map(key => (
                      <View key={key} style={styles.itemListaGerir}>
                        <Text>{c.itens[key].nome}</Text>
                        <TouchableOpacity onPress={() => apagarItem(c.id, key)}><Text>❌</Text></TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {/* TELA 3: INFORMAÇÕES DO CADASTRO */}
            {menuAtivo === 'cadastro' && (
              <View>
                <Text style={styles.labelConfig}>DADOS DO RESTAURANTE</Text>
                <Text style={styles.label}>NOME:</Text>
                <TextInput style={styles.inputConfig} value={nomeRestaurante} editable={false} />
                <Text style={styles.label}>WHATSAPP:</Text>
                <TextInput style={styles.inputConfig} value={whatsappLoja} editable={false} />
                <Text style={styles.label}>ID DA LOJA:</Text>
                <TextInput style={styles.inputConfig} value={lojaID} editable={false} />
                <Text style={{color: 'gray', textAlign: 'center', marginTop: 20}}>Para alterar dados, contate o suporte.</Text>
              </View>
            )}

            {/* TELA 4: LINGUAGEM */}
            {menuAtivo === 'linguagem' && (
  <View style={{ marginTop: 10 }}>
    <Text style={styles.labelConfig}>SELECIONE O IDIOMA / SELECT LANGUAGE</Text>
    
    <TouchableOpacity 
      style={[styles.menuItem, { borderLeftWidth: 5, borderLeftColor: idioma === 'PT' ? '#27AE60' : '#CCC' }]} 
      onPress={() => { setIdioma('PT'); Alert.alert("Sucesso", "Idioma alterado para Português"); }}
    >
      <Text style={styles.menuItemTxt}>🇧🇷 Português (Brasil)</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={[styles.menuItem, { borderLeftWidth: 5, borderLeftColor: idioma === 'EN' ? '#27AE60' : '#CCC' }]} 
      onPress={() => { setIdioma('EN'); Alert.alert("Success", "Language changed to English"); }}
    >
      <Text style={styles.menuItemTxt}>🇺🇸 English (USA)</Text>
    </TouchableOpacity>
  </View>
)}

          </ScrollView>
        </SafeAreaView>
      </Modal>
      <Modal visible={verCardapioCliente} animationType="slide">
  <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#27ae60' }}>
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>CARDÁPIO DIGITAL</Text>
      <TouchableOpacity onPress={() => setVerCardapioCliente(false)}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>FECHAR [X]</Text>
      </TouchableOpacity>
    </View>

    {/* Aqui chamamos o arquivo que você criou */}
    <CardapioCliente 
      lojaID={lojaID} 
      whatsappLoja={whatsappLoja} 
    />
  </SafeAreaView>
</Modal>
    </SafeAreaView>
  );
}
{/* MODAL DO CARDÁPIO DIGITAL (VISÃO DO CLIENTE) */}
 
const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: '#fff',
  padding: 10,
},
  loginEmoji: { fontSize: 60, marginBottom: 10 },
  loginTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, color: '#000' },
  loginInput: { width: '100%', backgroundColor: '#F0F0F0', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#333', marginBottom: 15, color: '#000', fontSize: 16 },
  loginBtn: { width: '100%', backgroundColor: '#000', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  whiteBold: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 20, color: '#27AE60', fontWeight: 'bold', fontSize: 15 },
  header: { flexDirection: 'row', backgroundColor: '#000', padding: 10 },
  abaBtn: { flex: 1, alignItems: 'center', padding: 20,},
  abaAtiva: { borderBottomWidth: 4, borderBottomColor: '#27AE60' },
  abaTxt: { color: '#FFF', fontWeight: 'bold',},
  p15: { padding: 15 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, elevation: 5 },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 5, fontSize: 14 },
  input: { borderWidth: 2, borderColor: '#000', borderRadius: 8, padding: 12, marginBottom: 15, color: '#000', fontSize: 16, backgroundColor: '#FAFAFA' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tipoBtn: { flex: 1, padding: 12, backgroundColor: '#EEE', borderRadius: 8, alignItems: 'center', margin: 2, borderWidth: 1, borderColor: '#DDD' },
  bgPreto: { backgroundColor: '#000' },
  white: { color: '#FFF' },
  catTitulo: { fontWeight: 'bold', color: '#E67E22', marginTop: 20, marginBottom: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  itemCard: { padding: 12, backgroundColor: '#F0F0F0', borderRadius: 8, margin: 4, width: '47%', borderWidth: 1, borderColor: '#CCC' },
  itemTxt: { textAlign: 'center', fontSize: 13, fontWeight: '600' },
  boxAdd: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginTop: 10, borderWidth: 2, borderColor: '#27AE60' },
  btnVerde: { backgroundColor: '#27AE60', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  sacola: { backgroundColor: '#FFF', padding: 15, marginTop: 15, borderTopWidth: 3, borderTopColor: '#27AE60', elevation: 10 },
  bold: { fontWeight: 'bold' },
  pedCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 12, borderLeftWidth: 8, borderLeftColor: '#000', elevation: 3 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  btnAcao: { padding: 10, borderWidth: 1.5, borderRadius: 8, margin: 3, borderColor: '#333' },
  fab: { position: 'absolute', bottom: 25, right: 25, backgroundColor: '#FFF', width: 60, height: 60, borderRadius: 30, elevation: 8, alignItems: 
  'center', justifyContent: 'center', borderWidth: 2, borderColor: '#000' },
  storiesWrapper: { padding: 10, borderBottomWidth: 1, borderColor: '#EEE' },
  storyCircle: { width: 55, height: 55, borderRadius: 28, backgroundColor: '#EEE', marginRight: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CCC' },
  storyCircleActive: { backgroundColor: '#27AE60', borderColor: '#27AE60' },
  qtdBtn: { backgroundColor: '#000', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  filtroContainer: { flexDirection: 'row', padding: 10 },
  filtroBtn: { padding: 12, alignItems: 'center', backgroundColor: '#EEE', borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#CCC' },
  filtroAtivo: { backgroundColor: '#000' },
  labelConfig: { fontWeight: 'bold', fontSize: 20, marginBottom: 20, color: '#27AE60' },
  inputConfig: { borderWidth: 2, borderColor: '#333', padding: 14, borderRadius: 10, marginBottom: 15, backgroundColor: '#F9F9F9', color: '#000', fontSize: 16 }, menuItem: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  menuItemTxt: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },
  menuItemSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
   
  divisor: { height: 2, backgroundColor: '#EEE', marginVertical: 25 },
  itemListaGerir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#EEE' },
  faturamentoCard: {
    backgroundColor: '#27AE60',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  faturamentoLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.9,
  },
  faturamentoValor: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5
  },
  faturamentoBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 50
  },   obsContainer: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: 8,
    marginTop: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },

  obsIcon: {
    fontSize: 16,
    marginRight: 6
  },

  obsPedido: {
    color: '#856404',
    fontWeight: 'bold',
    flex: 1
  }, botaoImprimir: {
  backgroundColor: '#555',
  padding: 8,
  borderRadius: 6,
  marginTop: 5,
  alignItems: 'center'
}, scrollContent: {
  paddingBottom: 50,
},

scrollContentWeb: {
  maxWidth: 1000,
  alignSelf: 'center',
  width: '100%',
},
  
}); //
