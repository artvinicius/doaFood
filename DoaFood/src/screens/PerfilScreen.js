import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, shadowSm } from '../theme';
import { getSession, clearSession } from '../services/db';

const TIPO_LABEL = {
  doador:   { texto: 'Doador',   icone: '🎁', cor: colors.verde   },
  receptor: { texto: 'Receptor', icone: '🤲', cor: colors.laranja  },
  ong:      { texto: 'ONG',      icone: '🏢', cor: '#6a1b9a'       },
};

function MenuItem({ ionicon, titulo, subtitulo, onPress, perigoso }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons
        name={ionicon}
        size={20}
        color={perigoso ? colors.erro : colors.cinza600}
        style={styles.menuIcone}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuTitulo, perigoso && { color: colors.erro }]}>{titulo}</Text>
        {subtitulo ? <Text style={styles.menuSub}>{subtitulo}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={perigoso ? colors.erro : colors.cinza400} />
    </TouchableOpacity>
  );
}

export default function PerfilScreen({ navigation }) {
  const [notificacoes, setNotificacoes] = useState(true);
  const [usuario, setUsuario]           = useState(null);

  // Recarrega o perfil sempre que a tela ganha foco (ex: voltando do EditarPerfil)
  useFocusEffect(
    useCallback(() => {
      getSession().then((u) => {
        if (!u) { navigation.replace('Login'); return; }
        setUsuario(u);
      });
    }, []),
  );

  const tipo = TIPO_LABEL[usuario?.tipoConta] ?? TIPO_LABEL.doador;

  function handleSair() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await clearSession();
            navigation.replace('Login');
          },
        },
      ],
    );
  }

  if (!usuario) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.verde} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Cabeçalho */}
        <View style={styles.cabecalho}>
          <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>

          <View style={styles.avatarGrande}>
            <Text style={styles.avatarInicial}>
              {usuario.nome.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.nome}>{usuario.nome}</Text>
          <Text style={styles.email}>{usuario.email}</Text>

          <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.badgeText}>{tipo.icone} {tipo.texto}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{usuario.totalDoacoes ?? 0}</Text>
            <Text style={styles.statLabel}>Doações</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMid]}>
            <Text style={styles.statNum}>📍</Text>
            <Text style={styles.statLabel}>{usuario.cidade || 'Não informado'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>🗓️</Text>
            <Text style={styles.statLabel}>Desde {usuario.membroDesde}</Text>
          </View>
        </View>

        {/* Minha Conta */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>MINHA CONTA</Text>
          <View style={styles.card}>
            <MenuItem
              ionicon="pencil-outline"
              titulo="Editar perfil"
              subtitulo="Nome, telefone, cidade"
              onPress={() => navigation.navigate('EditarPerfil')}
            />
            <View style={styles.divider} />
            <MenuItem
              ionicon="lock-closed-outline"
              titulo="Alterar senha"
              onPress={() => navigation.navigate('EditarPerfil')}
            />
            <View style={styles.divider} />
            <MenuItem
              ionicon="call-outline"
              titulo="Contatos e endereço"
              subtitulo="Telefone, cidade, bairro"
              onPress={() => navigation.navigate('EditarPerfil')}
            />
          </View>
        </View>

        {/* Preferências */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>PREFERÊNCIAS</Text>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <Ionicons name="notifications-outline" size={20} color={colors.cinza600} style={styles.menuIcone} />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitulo}>Notificações</Text>
                <Text style={styles.menuSub}>Novas doações na sua região</Text>
              </View>
              <Switch
                value={notificacoes}
                onValueChange={setNotificacoes}
                trackColor={{ false: colors.cinza200, true: colors.verde }}
                thumbColor={colors.branco}
              />
            </View>
            <View style={styles.divider} />
            <MenuItem
              ionicon="map-outline"
              titulo="Pontos de Coleta próximos"
              onPress={() => navigation.navigate('PontosColeta')}
            />
          </View>
        </View>

        {/* Suporte */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>SUPORTE</Text>
          <View style={styles.card}>
            <MenuItem
              ionicon="help-circle-outline"
              titulo="Central de ajuda"
              onPress={() => Alert.alert('Ajuda', 'Documentação disponível em breve.')}
            />
            <View style={styles.divider} />
            <MenuItem
              ionicon="document-text-outline"
              titulo="Termos de Uso"
              onPress={() => navigation.navigate('Termos')}
            />
            <View style={styles.divider} />
            <MenuItem
              ionicon="shield-checkmark-outline"
              titulo="Política de Privacidade"
              onPress={() => navigation.navigate('Termos')}
            />
          </View>
        </View>

        {/* Seção ONG — visível somente para tipoConta === 'ong' */}
        {usuario.tipoConta === 'ong' && !usuario.isAdmin && (
          <View style={styles.secao}>
            <Text style={[styles.secaoTitulo, { color: '#6a1b9a' }]}>MINHA ONG</Text>
            <View style={styles.card}>
              <MenuItem
                ionicon="location-outline"
                titulo="Cadastrar ponto de coleta"
                subtitulo="Visível para todos os usuários"
                onPress={() => navigation.navigate('OngCadastrarPonto')}
              />
            </View>
          </View>
        )}

        {/* Seção admin — visível somente para usuario.isAdmin */}
        {usuario.isAdmin && (
          <View style={styles.secao}>
            <Text style={[styles.secaoTitulo, { color: '#6a1b9a' }]}>ADMINISTRADOR</Text>
            <View style={styles.card}>
              <MenuItem
                ionicon="grid-outline"
                titulo="Painel administrativo"
                subtitulo="Usuários, ONGs e pontos de coleta"
                onPress={() => navigation.navigate('AdminDashboard')}
              />
            </View>
          </View>
        )}

        {/* Sair */}
        <View style={[styles.secao, { marginBottom: 40 }]}>
          <TouchableOpacity style={styles.btnSair} onPress={handleSair} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color={colors.erro} />
            <Text style={styles.btnSairText}>  Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cinza100 },

  cabecalho: {
    backgroundColor: colors.verde,
    padding: 24,
    alignItems: 'center',
    paddingBottom: 32,
  },
  voltarBtn:    { alignSelf: 'flex-start', marginBottom: 16 },
  avatarGrande: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.laranja,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInicial: { fontSize: 36, fontWeight: '800', color: colors.branco },
  nome:          { fontSize: 20, fontWeight: '800', color: colors.branco, marginBottom: 4 },
  email:         { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  badge:         { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 50 },
  badgeText:     { color: colors.branco, fontSize: 12, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.branco,
    padding: 16,
    gap: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.cinza200,
    ...shadowSm,
  },
  statCard:    { flex: 1, alignItems: 'center', paddingVertical: 8 },
  statCardMid: {
    borderLeftWidth: 1, borderRightWidth: 1,
    borderLeftColor: colors.cinza200, borderRightColor: colors.cinza200,
  },
  statNum:   { fontSize: 20, fontWeight: '800', color: colors.cinza900, marginBottom: 4 },
  statLabel: { fontSize: 11, color: colors.cinza600, textAlign: 'center' },

  secao:       { paddingHorizontal: 16, marginBottom: 8, marginTop: 16 },
  secaoTitulo: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1.5,
    color: colors.cinza600, marginBottom: 8,
  },
  card: {
    backgroundColor: colors.branco,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadowSm,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuIcone:  { width: 24, textAlign: 'center' },
  menuTitulo: { fontSize: 14, fontWeight: '700', color: colors.cinza900 },
  menuSub:    { fontSize: 12, color: colors.cinza400, marginTop: 2 },

  divider:   { height: 1, backgroundColor: colors.cinza200, marginLeft: 52 },
  switchRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },

  btnSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdecea',
    borderWidth: 2,
    borderColor: colors.erro,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  btnSairText: { color: colors.erro, fontWeight: '800', fontSize: 15 },
});
