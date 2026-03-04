import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, Alert, TextInput,
  StyleSheet, Linking, KeyboardAvoidingView, Platform, Share
} from 'react-native';

const BASE_URL = "https://marmitas-47af0-default-rtdb.firebaseio.com/";

export default function CardapioCliente({ lojaID, whatsappLoja }) {
  const [categorias, setCategorias] = useState([]);
  const [sacola, setSacola] = useState([]);
  const [busca, setBusca] = useState('');
  
  // Estados para o Modal de Quantidade
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);

  // Estados para Dados de Entrega
  const [nomeCliente, setNomeCliente] = useState('');
  const [endereco, setEndereco] = useState('');
  const [pagamento, setPagamento] = useState('Pix');

  useEffect(() => {
    const carregarCardapio = async () => {
      try {
        const res = await fetch(`${BASE_URL}/${lojaID}/config/cardapio.json`);
        const data = await res.json();
        if (data) {
          const formatado = Object.keys(data).map(k => ({ id: k, ...data[k] }));
          setCategorias(formatado);
        }
      } catch (e) { console.log("Erro:", e); }
    };
    if (lojaID) carregarCardapio();
  }, [lojaID]);

  const adicionarASacola = () => {
  const novoItem = {
    ...itemSelecionado,
    quantidade: quantidade,
    tamanho: tamanhoSelecionado,
    subtotal:
      parseFloat(itemSelecionado.precos?.[tamanhoSelecionado] || 0) *
      quantidade
  };

  setSacola([...sacola, novoItem]);
  setItemSelecionado(null);
  setQuantidade(1);
};

const removerItem = (index) => {
  const novaSacola = [...sacola];
  novaSacola.splice(index, 1);
  setSacola(novaSacola);
};

  const calcularTotalGeral = () => {
    return sacola.reduce((acc, curr) => acc + curr.subtotal, 0).toFixed(2);
  };

  const finalizarPedido = () => {
    if (!nomeCliente || !endereco) {
      return Alert.alert("Ops!", "Por favor, preencha seu nome e endereço para entrega.");
    }

    const listaItens = sacola.map(i => `• ${i.quantidade}x ${i.nome} (${i.tamanho || ''})`).join('\n');
    
    const mensagem = 
`*NOVO PEDIDO - DELIVERY* 🛵

*CLIENTE:* ${nomeCliente}
*ENDEREÇO:* ${endereco}

*ITENS:*
${listaItens}

*TOTAL:* R$ ${calcularTotalGeral()}
*PAGAMENTO:* ${pagamento}

_Pedido enviado via Cardápio Digital_`;

    const numeroLimpo = whatsappLoja.replace(/\D/g, '');
    fetch(`${BASE_URL}/${lojaID}/pedidos.json`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cliente: nomeCliente,
    endereco,
    pagamento,
    itens: sacola,
    total: calcularTotalGeral(),
    data: new Date().toISOString(),
    status: "novo"
  })
});
    Linking.openURL(`https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`);
 setSacola([]);
setNomeCliente('');
setEndereco(''); };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
    >
      <ScrollView style={styles.container}>
        <TextInput 
          style={styles.inputBusca} 
          placeholder="🔍 Buscar no cardápio..." 
          value={busca} 
          onChangeText={setBusca} 
        />

        {/* Lista de Produtos */}
        {categorias.map(cat => (
          <View key={cat.id} style={{ marginBottom: 20 }}>
            <Text style={styles.tituloCat}>{cat.nome?.toUpperCase()}</Text>
            {cat.itens && Object.keys(cat.itens).map(key => {
              const item = cat.itens[key];
              if (busca && !item.nome.toLowerCase().includes(busca.toLowerCase())) return null;

              return (
                <TouchableOpacity key={key} style={styles.cardItem} onPress={() => {
  setItemSelecionado(item);

  const tamanhos = Object.keys(item.precos || {});
  setTamanhoSelecionado(tamanhos[0] || 'UNICO');
}}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nomeItem}>{item.nome}</Text>
                    <Text style={styles.descItem} numberOfLines={2}>{item.descricao}</Text>
                    <Text style={styles.precoItem}>R$ {parseFloat(item.precos?.UNICO || 0).toFixed(2)}</Text>
                  </View>
                  {item.imagem && <Image source={{ uri: item.imagem }} style={styles.fotoItem} />}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Formuário de Entrega (Só aparece se tiver itens na sacola) */}
        {sacola.length > 0 && (
          <View style={styles.sessaoEntrega}>
            <Text style={styles.tituloEntrega}>DADOS PARA ENTREGA 🛵</Text>
            
            <TextInput 
              style={styles.input} 
              placeholder="Seu Nome completo" 
              value={nomeCliente} 
              onChangeText={setNomeCliente}
            />
            
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              placeholder="Endereço (Rua, Número, Bairro, Ref)" 
              multiline
              value={endereco} 
              onChangeText={setEndereco}
            />

            <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>Forma de Pagamento:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {['Pix', 'Cartão', 'Dinheiro'].map(tipo => (
                <TouchableOpacity 
                  key={tipo} 
                  style={[styles.btnPagto, pagamento === tipo && styles.btnPagtoAtivo]}
                  onPress={() => setPagamento(tipo)}
                >
                  <Text style={{ color: pagamento === tipo ? '#fff' : '#000' }}>{tipo}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {sacola.length > 0 && (
  <View style={{ backgroundColor: '#fff', padding: 15, borderRadius: 15, marginTop: 10 }}>
    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
      RESUMO DO PEDIDO 🛒
    </Text>

    {sacola.map((item, index) => (
      <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text>{item.quantidade}x {item.nome}</Text>
        <TouchableOpacity onPress={() => removerItem(index)}>
          <Text style={{ color: 'red' }}>Remover</Text>
        </TouchableOpacity>
      </View>
    ))}

    <Text style={{ marginTop: 10, fontWeight: 'bold' }}>
      Total: R$ {calcularTotalGeral()}
    </Text>
  </View>
)}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* MODAL DE QUANTIDADE */}
      {itemSelecionado && (
        <View style={styles.overlay}>
          <View style={styles.modalQtd}>
            <Text style={styles.modalTitulo}>{itemSelecionado.nome}</Text>
            {itemSelecionado.precos && Object.keys(itemSelecionado.precos).length > 1 && (
  <View style={{ flexDirection: 'row', marginVertical: 10 }}>
    {Object.keys(itemSelecionado.precos).map(tam => (
      <TouchableOpacity
        key={tam}
        style={[
          styles.btnPagto,
          tamanhoSelecionado === tam && styles.btnPagtoAtivo
        ]}
        onPress={() => setTamanhoSelecionado(tam)}
      >
        <Text style={{ color: tamanhoSelecionado === tam ? '#fff' : '#000' }}>
          {tam}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
)}
            <View style={styles.seletor}>
              <TouchableOpacity style={styles.btnQtd} onPress={() => setQuantidade(Math.max(1, quantidade - 1))}>
                <Text style={styles.txtBtn}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtdNum}>{quantidade}</Text>
              <TouchableOpacity style={styles.btnQtd} onPress={() => setQuantidade(quantidade + 1)}>
                <Text style={styles.txtBtn}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.btnConfirmar} onPress={adicionarASacola}>
              <Text style={styles.txtBranco}>ADICIONAR R$ {(parseFloat(itemSelecionado.precos?.[tamanhoSelecionado] || 0) * quantidade).toFixed(2)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setItemSelecionado(null)}>
              <Text style={{ color: 'red', marginTop: 15 }}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* BOTÃO FINALIZAR */}
      {sacola.length > 0 && (
        <TouchableOpacity style={styles.btnZap} onPress={finalizarPedido}>
          <Text style={styles.txtBranco}>ENVIAR PEDIDO (R$ {calcularTotalGeral()})</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15 },
  inputBusca: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  tituloCat: { fontSize: 18, fontWeight: 'bold', color: '#27ae60', marginBottom: 10 },
  cardItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  nomeItem: { fontSize: 16, fontWeight: 'bold' },
  descItem: { fontSize: 13, color: '#777', marginVertical: 4 },
  precoItem: { fontSize: 15, fontWeight: 'bold', color: '#27ae60' },
  fotoItem: { width: 80, height: 80, borderRadius: 8, marginLeft: 10 },
  sessaoEntrega: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginTop: 10, borderWidth: 1, borderColor: '#ddd' },
  tituloEntrega: { fontWeight: 'bold', fontSize: 16, marginBottom: 15, color: '#333' },
  input: { borderBottomWidth: 1, borderBottomColor: '#ddd', marginBottom: 15, paddingVertical: 8 },
  btnPagto: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', minWidth: 80, alignItems: 'center' },
  btnPagtoAtivo: { backgroundColor: '#27ae60', borderColor: '#27ae60' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalQtd: { backgroundColor: '#fff', padding: 25, borderRadius: 20, width: '100%', alignItems: 'center' },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  seletor: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  btnQtd: { backgroundColor: '#eee', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  qtdNum: { fontSize: 24, fontWeight: 'bold', marginHorizontal: 30 },
  txtBtn: { fontSize: 25, fontWeight: 'bold' },
  btnConfirmar: { backgroundColor: '#27ae60', padding: 18, borderRadius: 12, width: '100%', alignItems: 'center' },
  txtBranco: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnZap: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#25D366', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 10 }
});