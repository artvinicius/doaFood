import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadowSm } from '../theme';
import CardCatalogo from '../components/CardCatalogo';
import { getDoadores, getReceptores, getOngs } from '../services/api';

const TABS = [
  { key: 'doador',   label: 'Doadores',   icon: 'gift-outline'     },
  { key: 'receptor', label: 'Receptores', icon: 'heart-outline'    },
  { key: 'ong',      label: 'ONGs',       icon: 'business-outline' },
];

const FETCHERS = {
  doador:   () => getDoadores(),
  receptor: () => getReceptores(),
  ong:      () => getOngs(),
};

export default function CatalogoScreen({ navigation }) {
  const [tabAtiva, setTabAtiva]   = useState('doador');
  const [busca, setBusca]         = useState('');
  const [dados, setDados]         = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    FETCHERS[tabAtiva]()
      .then((lista) => { if (ativo) setDados(lista); })
      .catch(() => { if (ativo) setDados([]); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tabAtiva]);

  const filtrados = useMemo(() => {
    if (!busca.trim()) return dados;
    const q = busca.toLowerCase();
    return dados.filter(
      (i) =>
        i.nome?.toLowerCase().includes(q) ||
        i.cidade?.toLowerCase().includes(q) ||
        i.descricao?.toLowerCase().includes(q),
    );
  }, [dados, busca]);

  function handlePress(item) {
    if (tabAtiva === 'doador')   navigation.navigate('DoadorDetalhe',   { item });
    if (tabAtiva === 'receptor') navigation.navigate('ReceptorDetalhe', { item });
    if (tabAtiva === 'ong')      navigation.navigate('ONGDetalhe',      { item });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Doa<Text style={{ color: colors.laranja }}>Food</Text></Text>
          <Text style={styles.headerSub}>Encontre quem doa e quem precisa</Text>
        </View>
        <TouchableOpacity
          style={styles.perfilBtn}
          onPress={() => navigation.navigate('Perfil')}
        >
          <Ionicons name="person-circle-outline" size={36} color={colors.branco} />
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={16} color={colors.cinza400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, cidade ou tipo..."
            placeholderTextColor={colors.cinza400}
            value={busca}
            onChangeText={setBusca}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tabAtiva === t.key && styles.tabAtiva]}
            onPress={() => { if (tabAtiva !== t.key) { setTabAtiva(t.key); setBusca(''); } }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={t.icon}
              size={15}
              color={tabAtiva === t.key ? colors.branco : colors.cinza600}
            />
            <Text style={[styles.tabText, tabAtiva === t.key && styles.tabTextAtivo]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {carregando ? (
        <View style={styles.emptyBox}>
          <ActivityIndicator size="large" color={colors.verde} />
        </View>
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="search-outline" size={44} color={colors.cinza400} />
              <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <CardCatalogo item={item} tipo={tabAtiva} onPress={() => handlePress(item)} />
          )}
        />
      )}

      {/* FAB — pontos de coleta */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PontosColeta')}
        activeOpacity={0.85}
      >
        <Ionicons name="location-outline" size={18} color={colors.branco} />
        <Text style={styles.fabText}>Pontos de Coleta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cinza100 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.verde,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.branco },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  perfilBtn:   { padding: 4 },

  searchContainer: {
    backgroundColor: colors.verde,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.branco,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    ...shadowSm,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.cinza900,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.branco,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cinza200,
  },
  tab: {
    flex: 1,
    borderRadius: radius.full,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cinza100,
    flexDirection: 'row',
    gap: 5,
  },
  tabAtiva:     { backgroundColor: colors.verde },
  tabText:      { fontSize: 12, fontWeight: '700', color: colors.cinza600 },
  tabTextAtivo: { color: colors.branco },

  list: { padding: 16, paddingBottom: 100 },

  emptyBox:  { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.cinza400 },

  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: colors.laranja,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabText: { color: colors.branco, fontWeight: '800', fontSize: 14 },
});
