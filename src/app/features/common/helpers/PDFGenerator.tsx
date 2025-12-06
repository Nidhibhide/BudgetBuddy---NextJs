import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Transaction,TransactionPDFProps } from '@/app/types/appTypes';
import { useTranslations } from 'next-intl';

// Create styles
const baseTableCell = {
  margin: 'auto',
  marginTop: 5,
  fontSize: 10,
  padding: 5,
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e5e7eb',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
  },
  tableCell: baseTableCell,
  tableCellHeader: {
    ...baseTableCell,
    fontWeight: 'bold',
  },
  expenseCell: {
    ...baseTableCell,
    color: '#dc2626',
  },
  incomeCell: {
    ...baseTableCell,
    color: '#16a34a',
  },
});

const Footer: React.FC = () => {
  const tCommon = useTranslations('common');
  return (
    <>
      <Text style={{ fontSize: 8, textAlign: 'center', marginTop: 20, color: '#6b7280' }}>
        {tCommon('pdf.footer.generatedBy')}
      </Text>
      <Text style={{ fontSize: 6, textAlign: 'center', marginTop: 5, color: '#9ca3af' }}>
        {tCommon('pdf.footer.generatedOn')} {new Date().toLocaleDateString()}
      </Text>
    </>
  );
};

// PDF Document Component
const TransactionPDF: React.FC<TransactionPDFProps> = ({
  transactions = [],
  selectedCategory = "All",
  currency = "INR",
  categories = []
}) => {
  const t = useTranslations();
  const tCommon = useTranslations('common');

  const tableHeaders = [t('backend.validation.date'), t('backend.validation.description'), t('backend.validation.category'), t('backend.validation.amount'), t('backend.validation.type')];

  const renderTransactionRow = (transaction: Transaction, index: number, currency: string) => (
    <View style={styles.tableRow} key={index}>
      <View style={styles.tableCol}>
        <Text style={styles.tableCell}>
          {transaction.date
            ? new Date(transaction.date as string | number | Date).toLocaleDateString("en-GB")
            : ""}
        </Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.tableCell}>{transaction.description}</Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.tableCell}>{String(transaction.category || '')}</Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.tableCell}>
          {transaction.amount} {currency}
        </Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={transaction.type === 'Expense' ? styles.expenseCell : styles.incomeCell}>
          {transaction.type}
        </Text>
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{tCommon('pdf.title')}</Text>
          <Text style={{ fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
            {selectedCategory === "All" ? `${tCommon('pdf.categoriesAll')} (${categories.join(', ')})` : `${t('backend.validation.category')}: ${selectedCategory}`}
          </Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              {tableHeaders.map((header, index) => (
                <View key={index} style={styles.tableCol}>
                  <Text style={styles.tableCellHeader}>{header}</Text>
                </View>
              ))}
            </View>
            {/* Table Body */}
            {transactions.length > 0 ? transactions.map((transaction, index) => renderTransactionRow(transaction, index, currency)) : (
              <View style={styles.tableRow}>
                <View style={{...styles.tableCol, width: '100%'}}>
                  <Text style={{...styles.tableCell, textAlign: 'center'}}>{tCommon('pdf.noTransactions')}</Text>
                </View>
              </View>
            )}
          </View>
          <Footer />
        </View>
      </Page>
    </Document>
  );
};

export { TransactionPDF };