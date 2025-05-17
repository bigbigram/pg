import { BFSPKIImplementation } from './BFSPKIImplementation';

export const generateRequestChecksum = (data: Record<string, string>): string => {
  const orderedFields = [
    'bfs_benfBankCode',
    'bfs_benfId', 
    'bfs_benfTxnTime',
    'bfs_msgType',
    'bfs_orderNo',
    'bfs_paymentDesc',
    'bfs_remitterEmail',
    'bfs_txnAmount',
    'bfs_txnCurrency',
    'bfs_version'
  ];

  return orderedFields.map(field => data[field]).join('|');
};

export const generateResponseChecksum = (data: Record<string, string>): string => {
  const orderedFields = [
    'bfs_benfId',
    'bfs_benfTxnTime',
    'bfs_bfsTxnId',
    'bfs_bfsTxnTime',
    'bfs_debitAuthCode',
    'bfs_debitAuthNo',
    'bfs_msgType',
    'bfs_orderNo',
    'bfs_remitterBankId',
    'bfs_remitterName',
    'bfs_txnAmount',
    'bfs_txnCurrency'
  ];

  return orderedFields.map(field => data[field]).join('|');
};
