export interface BFSParams {
  bfs_msgType: string;
  bfs_benfId: string;
  bfs_orderNo: string;
  bfs_benfTxnTime: string;
  bfs_benfBankCode: string;
  bfs_txnCurrency: string;
  bfs_txnAmount: string;
  bfs_remitterEmail: string;
  bfs_paymentDesc: string;
  bfs_version: string;
}

export interface BFSSubmitData {
  bfs_msgType: string;
  bfs_benfId: string;
  bfs_orderNo: string;
  bfs_benfTxnTime: string;
  bfs_benfBankCode: string;
  bfs_txnCurrency: string;
  bfs_txnAmount: string;
  bfs_remitterEmail: string;
  bfs_paymentDesc: string;
  bfs_version: string;
  bfs_checkSum: string;
}
