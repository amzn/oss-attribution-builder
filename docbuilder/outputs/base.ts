import { LicenseBucket } from '../structure';

export default interface OutputRenderer<O> {
  // constructor(outputDir?: string): void;
  render(licenseData: LicenseBucket[]): O;
}
