/**
 * Tela de detalhe reutilizável para Doador, Receptor e ONG.
 * Recebe { item, tipo } via route.params.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, shadowSm } from '../theme';

const TIPO_CONFIG = {
  doador:   { cor: colors.verde,   fundo: colors.verdeClaro,   titulo: 'Doador',    iconeAcao: '📦', textoAcao: 'Solicitar Doação'    },
  receptor: { cor: colors.laranja,  fundo: colors.laranjaClaro, titulo: 'Receptor',  iconeAcao: '🤝', textoAcao: 'Quero Ajudar'         },
  ong:      { cor: '#6a1b9a',       fundo: '#f3e5f5',           titulo: 'ONG',       iconeAcao: '💚', textoAcao: 'Entrar em Contato'    },
};

function InfoRow({ icone, label, valor }) {
  if (!valor) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcone}>{icone}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValor}>{valor}</Text>
      </View>
    </View>
  );
}

export default function DetalheScreen({ route, navigation }) {
  const { item, tipo } = route.params;
  const cfg = TIPO_CONFIG[tipo] ?? TIPO_CONFIG.doador;

  function ligar() {
    if (!item.telefone) { Alert.alert('Sem telefone', 'Este cadastro não possui telefone.'); return; }
    Linking.openURL(`tel:${item.telefone.replace(/\D/g, '')}`);
  }

  function enviarEmail() {
    if (!item.email) { Alert.alert('Sem e-mail', 'Este cadastro não possui e-mail.'); return; }
    Linking.openURL(`mailto:${item.email}`);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cabeçalho colorido */}
        <View style={[styles.cabecalho, { backgroundColor: cfg.cor }]}>
          <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.voltarText}>← Voltar</Text>
          </TouchableOpacity>
          <View style={styles.avatarGrande}>
            <Text style={styles.avatarEmoji}>{item.icone}</Text>
          </View>
          <Text style={styles.cabNome}>{item.nome}</Text>
          <View style={[styles.cabBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.cabBadgeText}>{cfg.titulo}</Text>
          </View>
          <Text style={styles.cabLocal}>📍 {item.cidade}, {item.estado}</Text>
        </View>

        {/* Corpo */}
        <View style={styles.corpo}>
          {/* Descrição */}
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Sobre</Text>
            <Text style={styles.descricao}>{item.descricao}</Text>
          </View>

          {/* Tags */}
          {item.tags?.length > 0 && (
            <View style={styles.secao}>
              <Text style={styles.secaoTitulo}>Categorias</Text>
              <View style={styles.tagsRow}>
                {item.tags.map((t) => (
                  <View key={t} style={[styles.tag, { backgroundColor: cfg.fundo }]}>
                    <Text style={[styles.tagText, { color: cfg.cor }]}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Informações */}
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Informações</Text>
            <View style={styles.infoCard}>
              <InfoRow icone="🏠" label="Endereço"  valor={item.endereco} />
              <InfoRow icone="🕐" label="Horário"   valor={item.horario}  />
              <InfoRow icone="📞" label="Telefone"  valor={item.telefone} />
              <InfoRow icone="✉️" label="E-mail"    valor={item.email}    />
              {item.cnpj && <InfoRow icone="📋" label="CNPJ" valor={item.cnpj} />}
            </View>
          </View>

          {/* Ações de contato */}
          <View style={styles.acoesRow}>
            {item.telefone ? (
              <TouchableOpacity
                style={[styles.btnContato, { backgroundColor: cfg.fundo, borderColor: cfg.cor }]}
                onPress={ligar}
                activeOpacity={0.8}
              >
                <Text style={[styles.btnContatoText, { color: cfg.cor }]}>📞 Ligar</Text>
              </TouchableOpacity>
            ) : null}
            {item.email ? (
              <TouchableOpacity
                style={[styles.btnContato, { backgroundColor: cfg.fundo, borderColor: cfg.cor }]}
                onPress={enviarEmail}
                activeOpacity={0.8}
              >
                <Text style={[styles.btnContatoText, { color: cfg.cor }]}>✉️ E-mail</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Botão principal */}
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: cfg.cor }]}
            activeOpacity={0.85}
            onPress={() => Alert.alert(cfg.textoAcao, 'Funcionalidade disponível em breve com integração ao backend.')}
          >
            <Text style={styles.btnPrimaryText}>{cfg.iconeAcao}  {cfg.textoAcao}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cinza100 },

  cabecalho: {
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
    paddingBottom: 32,
  },
  voltarBtn:    { alignSelf: 'flex-start', marginBottom: 12 },
  voltarText:   { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700' },
  avatarGrande: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji:    { fontSize: 38 },
  cabNome:        { fontSize: 22, fontWeight: '800', color: colors.branco, textAlign: 'center', marginBottom: 6 },
  cabBadge:       { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 50, marginBottom: 6 },
  cabBadgeText:   { color: colors.branco, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  cabLocal:       { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  corpo: {
    backgroundColor: colors.branco,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    padding: 24,
    ...shadow,
  },

  secao: { marginBottom: 20 },
  secaoTitulo: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.cinza600,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  descricao: { fontSize: 15, color: colors.cinza900, lineHeight: 22 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 50 },
  tagText: { fontSize: 13, fontWeight: '700' },

  infoCard: {
    backgroundColor: colors.cinza100,
    borderRadius: radius.md,
    padding: 16,
    gap: 14,
  },
  infoRow:   { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoIcone: { fontSize: 20, marginTop: 1 },
  infoLabel: { fontSize: 11, color: colors.cinza600, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValor: { fontSize: 14, color: colors.cinza900 },

  acoesRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  btnContato: {
    flex: 1,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnContatoText: { fontWeight: '700', fontSize: 14 },

  btnPrimary: {
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadow,
  },
  btnPrimaryText: { color: colors.branco, fontWeight: '800', fontSize: 15 },
});
