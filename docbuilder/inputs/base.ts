import { Package } from '../structure';

type PackageIdentifier = string;

export default interface MetadataSource {
  listPackages(): PackageIdentifier[];
  getPackage(id: PackageIdentifier): Package | undefined;
}
