import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, shadowSm } from '../theme';
import { getSession } from '../services/db';
import { getPontosColeta } from '../services/api';

function staticMapUrl(lat, lng, zoom = 15, w = 400, h = 160) {
  return `https://maps.wikimedia.org/img/osm-intl,${zoom},${lat},${lng},${w}x${h}.png`;
}

function abrirMaps(lat, lng, nome) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  Linking.openURL(url);
}

function mapPonto(p) {
  return {
    ...p,
    icone: '📦',
    operador: `${p.cidade}, ${p.estado}`,
    aceitam: [],
    naoaceitam: [],
    distancia: p.cidade,
    ativo: true,
  };
}

function PontoCard({ ponto, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={styles.iconeBox}>
          <Text style={styles.icone}>{ponto.icone}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Text style={styles.nome} numberOfLines={1}>{ponto.nome}</Text>
            <View style={[styles.statusBadge, { backgroundColor: ponto.ativo ? colors.verdeClaro : colors.cinza200 }]}>
              <Text style={[styles.statusText, { color: ponto.ativo ? colors.verde : colors.cinza600 }]}>
                {ponto.ativo ? '● Ativo' : '● Fechado'}
              </Text>
            </View>
          </View>
          <Text style={styles.operador}>{ponto.operador}</Text>
          <View style={styles.distanciaRow}>
            <Ionicons name="location-outline" size={12} color={colors.laranja} />
            <Text style={styles.distancia}> {ponto.distancia} de distância</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <View style={styles.infoLine}>
          <Ionicons name="home-outline" size={13} color={colors.cinza600} />
          <Text style={styles.endereco} numberOfLines={2}>  {ponto.endereco}</Text>
        </View>
        <View style={styles.infoLine}>
          <Ionicons name="time-outline" size={13} color={colors.cinza600} />
          <Text style={styles.horario}>  {ponto.horario}</Text>
        </View>
      </View>

      {ponto.aceitam.length > 0 && (
        <View style={styles.aceitamRow}>
          {ponto.aceitam.slice(0, 3).map((a) => (
            <View key={a} style={styles.tag}>
              <Text style={styles.tagText}>{a}</Text>
            </View>
          ))}
          {ponto.aceitam.length > 3 && (
            <Text style={styles.tagMais}>+{ponto.aceitam.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

function InfoDetalhe({ icone, label, valor }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icone} size={18} color={colors.cinza600} style={styles.infoIcone} />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValor}>{valor}</Text>
      </View>
    </View>
  );
}

function PontoDetalhe({ ponto, onFechar }) {
  function ligar() {
    Linking.openURL(`tel:${ponto.telefone.replace(/\D/g, '')}`);
  }

  return (
    <View style={styles.detalheOverlay}>
      <View style={styles.detalheCard}>
        <View style={styles.detalheHeader}>
          <Text style={styles.detalheNome} numberOfLines={1}>{ponto.icone}  {ponto.nome}</Text>
          <TouchableOpacity onPress={onFechar} style={styles.fecharBtnArea}>
            <Ionicons name="close" size={22} color={colors.cinza600} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.detalheOperador}>{ponto.operador}</Text>

          <View style={[styles.statusBadge, {
            backgroundColor: ponto.ativo ? colors.verdeClaro : colors.cinza200,
            alignSelf: 'flex-start', marginBottom: 14,
          }]}>
            <Text style={[styles.statusText, { color: ponto.ativo ? colors.verde : colors.cinza600 }]}>
              {ponto.ativo ? '● Ativo agora' : '● Temporariamente fechado'}
            </Text>
          </View>

          {/* ── Mapa estático ─────────────────────────────────────────── */}
          <TouchableOpacity
            style={styles.mapaContainer}
            onPress={() => abrirMaps(ponto.lat, ponto.lng, ponto.nome)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: staticMapUrl(ponto.lat, ponto.lng) }}
              style={styles.mapaImagem}
              resizeMode="cover"
            />
            <View style={styles.mapaPino}>
              <Ionicons name="location" size={32} color={colors.erro} />
            </View>
            <View style={styles.mapaOverlay}>
              <Ionicons name="navigate-outline" size={13} color={colors.branco} />
              <Text style={styles.mapaOverlayText}>  Toque para abrir no Google Maps</Text>
            </View>
          </TouchableOpacity>

          <InfoDetalhe icone="home-outline"     label="Endereço"  valor={ponto.endereco} />
          <InfoDetalhe icone="time-outline"     label="Horário"   valor={ponto.horario}  />
          <InfoDetalhe icone="call-outline"     label="Telefone"  valor={ponto.telefone} />
          <InfoDetalhe icone="location-outline" label="Distância" valor={ponto.distancia} />

          {ponto.aceitam.length > 0 && (
            <View style={styles.detalheSecao}>
              <Text style={styles.detalheSecaoTitulo}>✅ Aceitam</Text>
              <View style={styles.tagRow}>
                {ponto.aceitam.map((a) => (
                  <View key={a} style={[styles.tag, { backgroundColor: colors.verdeClaro }]}>
                    <Text style={[styles.tagText, { color: colors.verde }]}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {ponto.naoaceitam.length > 0 && (
            <View style={styles.detalheSecao}>
              <Text style={styles.detalheSecaoTitulo}>❌ Não aceitam</Text>
              <View style={styles.tagRow}>
                {ponto.naoaceitam.map((a) => (
                  <View key={a} style={[styles.tag, { backgroundColor: '#fdecea' }]}>
                    <Text style={[styles.tagText, { color: colors.erro }]}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.btnLigar} onPress={ligar} activeOpacity={0.85}>
            <Ionicons name="call-outline" size={18} color={colors.branco} />
            <Text style={styles.btnLigarText}>  Ligar para este ponto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnMapa}
            onPress={() => abrirMaps(ponto.lat, ponto.lng, ponto.nome)}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate-outline" size={18} color={colors.laranjaEscuro} />
            <Text style={styles.btnMapaText}>  Ver no Google Maps</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

export default function PontosColetaScreen({ navigation }) {
  const [selecionado, setSelecionado]   = useState(null);
  const [filtroAtivo, setFiltroAtivo]   = useState(false);
  const [pontos, setPontos]             = useState([]);
  const [carregando, setCarregando]     = useState(true);
  const [isOng, setIsOng]               = useState(false);

  useFocusEffect(useCallback(() => {
    setCarregando(true);
    Promise.all([
      getPontosColeta(),
      getSession(),
    ])
      .then(([lista, usuario]) => {
        setPontos(lista.map(mapPonto));
        setIsOng(usuario?.tipoConta === 'ong' || Boolean(usuario?.isAdmin));
      })
      .catch(() => setPontos([]))
      .finally(() => setCarregando(false));
  }, []));

  const lista = filtroAtivo ? pontos.filter((p) => p.ativo) : pontos;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.branco} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitulo}>Pontos de Coleta</Text>
          <Text style={styles.headerSub}>{lista.length} ponto{lista.length !== 1 ? 's' : ''} encontrado{lista.length !== 1 ? 's' : ''}</Text>
        </View>
        {isOng && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('OngCadastrarPonto')}
          >
            <Ionicons name="add" size={22} color={colors.branco} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtroBar}>
        <TouchableOpacity
          style={[styles.filtroBtn, !filtroAtivo && styles.filtroBtnAtivo]}
          onPress={() => setFiltroAtivo(false)}
        >
          <Text style={[styles.filtroBtnText, !filtroAtivo && styles.filtroBtnTextAtivo]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtroAtivo && styles.filtroBtnAtivo]}
          onPress={() => setFiltroAtivo(true)}
        >
          <Text style={[styles.filtroBtnText, filtroAtivo && styles.filtroBtnTextAtivo]}>Apenas Ativos</Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.verde} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
          {lista.map((p) => (
            <PontoCard key={p.id} ponto={p} onPress={() => setSelecionado(p)} />
          ))}
        </ScrollView>
      )}

      {selecionado && (
        <PontoDetalhe ponto={selecionado} onFechar={() => setSelecionado(null)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cinza100 },

  header: {
    backgroundColor: colors.verde,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20, paddingBottom: 24,
    gap: 12,
  },
  voltarBtn:    { padding: 4 },
  addBtn:       { padding: 4 },
  headerTitulo: { fontSize: 22, fontWeight: '800', color: colors.branco },
  headerSub:    { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  filtroBar: {
    flexDirection: 'row',
    backgroundColor: colors.branco,
    padding: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: colors.cinza200,
  },
  filtroBtn:          { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: colors.cinza100 },
  filtroBtnAtivo:     { backgroundColor: colors.verde },
  filtroBtnText:      { fontSize: 13, fontWeight: '700', color: colors.cinza600 },
  filtroBtnTextAtivo: { color: colors.branco },

  lista: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: colors.branco,
    borderRadius: radius.md,
    padding: 14, marginBottom: 12,
    ...shadowSm,
  },
  cardTop:      { flexDirection: 'row', gap: 12, marginBottom: 10 },
  iconeBox: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.verdeClaro,
    alignItems: 'center', justifyContent: 'center',
  },
  icone: { fontSize: 24 },

  row:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  nome:         { flex: 1, fontSize: 14, fontWeight: '700', color: colors.cinza900 },
  operador:     { fontSize: 12, color: colors.cinza600 },
  distanciaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  distancia:    { fontSize: 12, color: colors.laranja, fontWeight: '700' },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50 },
  statusText:  { fontSize: 11, fontWeight: '700' },

  cardBottom: { marginBottom: 10, gap: 4 },
  infoLine:   { flexDirection: 'row', alignItems: 'flex-start' },
  endereco:   { fontSize: 12, color: colors.cinza600, lineHeight: 18, flex: 1 },
  horario:    { fontSize: 12, color: colors.cinza600 },

  aceitamRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:        { backgroundColor: colors.cinza100, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 50 },
  tagText:    { fontSize: 11, color: colors.cinza600, fontWeight: '600' },
  tagMais:    { fontSize: 12, color: colors.cinza400, alignSelf: 'center' },

  // Detalhe overlay
  detalheOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  detalheCard: {
    backgroundColor: colors.branco,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 24,
    maxHeight: '90%',
    ...shadow,
  },
  detalheHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detalheNome:     { fontSize: 17, fontWeight: '800', color: colors.cinza900, flex: 1 },
  fecharBtnArea:   { padding: 4 },
  detalheOperador: { fontSize: 13, color: colors.cinza600, marginBottom: 10 },

  // Mapa estático
  mapaContainer: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: 16,
    height: 160,
    backgroundColor: colors.cinza200,
  },
  mapaImagem: { width: '100%', height: '100%' },
  mapaPino: {
    position: 'absolute',
    top: '50%', left: '50%',
    marginTop: -32, marginLeft: -16,
  },
  mapaOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  mapaOverlayText: { color: colors.branco, fontSize: 12, fontWeight: '600' },

  detalheSecao:       { marginBottom: 16 },
  detalheSecaoTitulo: { fontSize: 13, fontWeight: '800', color: colors.cinza900, marginBottom: 8 },

  infoRow:   { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  infoIcone: { marginTop: 2 },
  infoLabel: { fontSize: 11, color: colors.cinza400, fontWeight: '700', textTransform: 'uppercase', marginBottom: 1 },
  infoValor: { fontSize: 14, color: colors.cinza900 },

  btnLigar: {
    backgroundColor: colors.verde,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    ...shadow,
  },
  btnLigarText: { color: colors.branco, fontWeight: '800', fontSize: 14 },

  btnMapa: {
    backgroundColor: colors.laranjaClaro,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2, borderColor: colors.laranja,
    marginBottom: 10,
  },
  btnMapaText: { color: colors.laranjaEscuro, fontWeight: '800', fontSize: 14 },
});
