import * as crypto from 'crypto';
import * as fs from 'fs/promises';

export class BFSPKIImplementation {
  private static readonly hexChar = '0123456789ABCDEF'.split('');

  public static async signData(
    pvtKeyFileName: string,
    dataToSign: string,
    signatureAlg: string = 'SHA1withRSA'
  ): Promise<string> {
    try {
      const privateKey = await fs.readFile(pvtKeyFileName, 'utf8');
      
      // Convert SHA1withRSA to Node.js format
      const nodeAlgorithm = signatureAlg === 'SHA1withRSA' ? 'RSA-SHA1' : signatureAlg;
      
      const signer = crypto.createSign(nodeAlgorithm);
      signer.update(dataToSign, 'utf8');
      const signature = signer.sign({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      });

      // Convert to uppercase hex string
      return signature.toString('hex').toUpperCase();
    } catch (error: unknown) {
      console.error('Signing error details:', {
        error,
        dataToSign,
        algorithm: signatureAlg
      });
      throw new Error(`Signing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public static async verifyData(
    pubKeyFileName: string,
    checkSumStr: string,
    checkSumFromMsg: string,
    signatureAlg: string = 'RSA-SHA1'
  ): Promise<boolean> {
    try {
      const publicKey = await fs.readFile(pubKeyFileName, 'utf8');
      const verifier = crypto.createVerify(signatureAlg);
      verifier.update(Buffer.from(checkSumStr));
      return verifier.verify(
        publicKey,
        Buffer.from(this.hexStringToByteArray(checkSumFromMsg))
      );
    } catch (error: unknown) {
      throw new Error(
        `Verification failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private static byteArrayToHexString(buffer: Buffer): string {
    return buffer.toString('hex').toUpperCase();
  }

  private static hexStringToByteArray(hex: string): Uint8Array {
    const pairs = hex.match(/.{1,2}/g) || [];
    return new Uint8Array(pairs.map(byte => 
      byte === 'FF' ? 255 : parseInt(byte, 16)
    ));
  }
}
