import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';

const SECOES = [
  {
    titulo: '1. Sobre o DoaFood',
    texto:
      'O DoaFood é uma plataforma digital gratuita que conecta doadores de alimentos, receptores e organizações não governamentais (ONGs) com o objetivo de reduzir o desperdício alimentar e combater a insegurança alimentar no Brasil. Ao se cadastrar, o usuário declara ter lido e aceito integralmente os presentes Termos de Uso.',
  },
  {
    titulo: '2. Elegibilidade',
    texto:
      'O uso da plataforma é permitido a pessoas físicas maiores de 18 anos e a pessoas jurídicas regularmente constituídas. Ao se cadastrar, o usuário garante que as informações fornecidas são verdadeiras, completas e atualizadas. O DoaFood se reserva o direito de suspender ou encerrar contas com dados falsos ou inconsistentes.',
  },
  {
    titulo: '3. Responsabilidades do Usuário',
    texto:
      'O usuário é o único responsável pelas informações que publica na plataforma, bem como pela qualidade, estado de conservação e adequação dos alimentos doados. O DoaFood atua exclusivamente como intermediário tecnológico e não participa diretamente das transações de doação, não se responsabilizando por quaisquer danos decorrentes de alimentos impróprios para consumo, informações incorretas ou descumprimento de acordos entre as partes.',
  },
  {
    titulo: '4. Proibições',
    texto:
      'É expressamente vedado ao usuário: (a) publicar informações falsas ou enganosas; (b) utilizar a plataforma para fins comerciais não autorizados; (c) realizar qualquer cobrança por alimentos declarados como doação; (d) discriminar receptores por qualquer critério; (e) transmitir conteúdo ofensivo, ilegal ou que viole direitos de terceiros; (f) tentar acessar dados de outros usuários sem autorização.',
  },
  {
    titulo: '5. Privacidade e Proteção de Dados',
    texto:
      'O DoaFood coleta e processa dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Os dados informados são utilizados exclusivamente para o funcionamento da plataforma, melhoria dos serviços e comunicações relacionadas. Não compartilhamos dados com terceiros para fins comerciais. O usuário pode solicitar a exclusão de seus dados a qualquer momento mediante contato com nossa equipe.',
  },
  {
    titulo: '6. Propriedade Intelectual',
    texto:
      'Todo o conteúdo da plataforma, incluindo marca, logotipo, layout, textos e código-fonte, é protegido por direitos de propriedade intelectual. É proibida a reprodução, distribuição ou uso comercial sem autorização expressa do DoaFood. O usuário concede ao DoaFood uma licença não exclusiva para exibir os conteúdos por ele publicados na plataforma.',
  },
  {
    titulo: '7. Encerramento de Conta',
    texto:
      'O usuário pode solicitar o encerramento de sua conta a qualquer momento pelas configurações do aplicativo. O DoaFood poderá suspender ou encerrar contas que violem estes Termos, sem aviso prévio. Após o encerramento, os dados do usuário serão anonimizados ou excluídos conforme a LGPD, exceto quando a retenção for exigida por lei.',
  },
  {
    titulo: '8. Limitação de Responsabilidade',
    texto:
      'O DoaFood não garante disponibilidade ininterrupta da plataforma e não se responsabiliza por perdas ou danos indiretos decorrentes de falhas técnicas, atos de terceiros ou caso fortuito. Em nenhuma hipótese a responsabilidade total do DoaFood perante um usuário excederá o valor de R$ 0,00 (zero reais), uma vez que a plataforma é inteiramente gratuita.',
  },
  {
    titulo: '9. Alterações nos Termos',
    texto:
      'O DoaFood pode alterar estes Termos a qualquer momento. As alterações serão comunicadas por meio de notificação no aplicativo com antecedência mínima de 7 (sete) dias. O uso continuado da plataforma após o prazo implica aceitação dos novos Termos.',
  },
  {
    titulo: '10. Foro e Lei Aplicável',
    texto:
      'Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo, SP, para dirimir quaisquer controvérsias decorrentes deste instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja.',
  },
];

export default function TermosScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.branco} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitulo}>Termos de Uso</Text>
          <Text style={styles.headerSub}>DoaFood — Versão 1.0 · Maio de 2025</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Ionicons name="document-text-outline" size={32} color={colors.verde} style={{ marginBottom: 10 }} />
          <Text style={styles.introTexto}>
            Leia atentamente antes de usar o aplicativo. Ao criar uma conta, você concorda com todos os termos descritos abaixo.
          </Text>
        </View>

        {SECOES.map((s, i) => (
          <View key={i} style={styles.secaoCard}>
            <Text style={styles.secaoTitulo}>{s.titulo}</Text>
            <Text style={styles.secaoTexto}>{s.texto}</Text>
          </View>
        ))}

        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>
            Última atualização: 01 de maio de 2025{'\n'}
            Dúvidas? Entre em contato: legal@doafood.com.br
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnFechar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.branco} />
          <Text style={styles.btnFecharText}>  Entendido — Fechar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cinza100 },

  header: {
    backgroundColor: colors.verde,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 24,
    gap: 12,
  },
  voltarBtn:    { padding: 4 },
  headerTitulo: { fontSize: 18, fontWeight: '800', color: colors.branco },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  conteudo: { padding: 16, paddingBottom: 40 },

  introCard: {
    backgroundColor: colors.branco,
    borderRadius: radius.md,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...shadow,
  },
  introTexto: {
    fontSize: 14,
    color: colors.cinza600,
    textAlign: 'center',
    lineHeight: 22,
  },

  secaoCard: {
    backgroundColor: colors.branco,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.verde,
  },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.cinza900,
    marginBottom: 8,
  },
  secaoTexto: {
    fontSize: 13,
    color: colors.cinza600,
    lineHeight: 21,
  },

  rodape: {
    marginTop: 8,
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.cinza200,
    borderRadius: radius.md,
  },
  rodapeTexto: {
    fontSize: 12,
    color: colors.cinza600,
    textAlign: 'center',
    lineHeight: 20,
  },

  btnFechar: {
    backgroundColor: colors.verde,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...shadow,
  },
  btnFecharText: { color: colors.branco, fontWeight: '800', fontSize: 15 },
});
