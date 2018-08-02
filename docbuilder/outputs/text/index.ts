import { LicenseBucket } from '../../structure';
import OutputRenderer from '../base';

export interface Annotation {
  lines: [number, number | undefined];
  [key: string]: any;
}

type AnnotationType = 'bucket' | 'license' | 'package';

export default class TextRenderer implements OutputRenderer<string> {
  private openAnnotations: { [type: string]: Annotation } = {};
  private finalAnnotations: Annotation[] = [];
  private lineNum = 0;
  private chunks: string[] = [];

  constructor() {}

  render(buckets: LicenseBucket[]): string {
    this.chunks = [];
    this.lineNum = 0;

    // output each license with its bucket of packages
    for (const bucket of buckets) {
      this.startAnnotation('bucket', { id: bucket.id });

      // output package names and copyright statements
      for (const {pkg, usage} of bucket.packages) {
        let statement = `** ${pkg.name}; version ${pkg.version} -- ${pkg.website}`;
        if (pkg.copyright) {
          statement += `\n${pkg.copyright}`;
        }

        this.startAnnotation('package', { uuid: pkg.uuid });
        this.addChunk(statement);
        this.endAnnotation('package');
      }

      // then output the license text itself
      this.addChunk(''); // spacing
      this.startAnnotation('license', { license: bucket.name });
      this.addChunk(bucket.text);
      this.endAnnotation('license');

      this.endAnnotation('bucket');
      this.addChunk('\n------\n');
    }

    // chop off the last chunk and join up
    const final = this.chunks.slice(0, -1).join('\n');
    return final;
  }

  get annotations(): Annotation[] {
    console.log('arstarstasr')
    return this.finalAnnotations;
  }

  private startAnnotation(type: AnnotationType, extra: any) {
    this.openAnnotations[type] = { lines: [this.lineNum, undefined], ...extra };
  }

  private endAnnotation(type: AnnotationType) {
    const open = this.openAnnotations[type];
    open.type = type;
    open.lines[1] = this.lineNum;
    this.finalAnnotations.push(open);
    delete this.openAnnotations[type];
  }

  private addChunk(str: string) {
    const len = str.split(/\r?\n/).length;
    this.lineNum += len;
    this.chunks.push(str);
  }
}
