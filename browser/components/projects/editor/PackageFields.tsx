/* Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import React = require('react');
import { connect } from 'react-redux';
import Select = require('react-select');

import { WebLicense, WebTag } from '../../../../server/api/licenses/interfaces';
import { WebPackage } from '../../../../server/api/packages/interfaces';
import * as LicenseActions from '../../../modules/licenses';
import * as PackageActions from '../../../modules/packages';
import debounce from '../../../util/debounce';
import FreeformSelect from '../../util/FreeformSelect';

export type PkgOutput = Partial<WebPackage>;

interface Props {
  initial?: Partial<WebPackage>;
  onChange?: (usage: PkgOutput) => void;

  dispatch: (action: any) => any;
  completions: WebPackage[];
  packages: PackageActions.PackageSet;
  licenses: WebLicense[];
  tags: {[key: string]: WebTag};
}

interface State {
  pkg: Partial<WebPackage>;
  selectedPackage: any;
}

interface LicenseOption extends Select.Option {
  tags: string[];
  shortText?: string[];
  longText?: string[];
  fixedText: boolean;
}

class PackageFields extends React.Component<Props, State> {

  licenseOptions: LicenseOption[] = [];
  licenseMap: {[name: string]: LicenseOption} = {};

  static defaultProps = {
    initial: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      pkg: {...this.props.initial},
      selectedPackage: null,
    };
  }

  componentWillMount() {
    const { dispatch, licenses } = this.props;
    if (licenses.length === 0) {
      dispatch(LicenseActions.fetchLicenses());
    } else {
      this.initLicenses();
    }
  }

  componentWillReceiveProps() {
    // no need to re-compute if the list was already built
    if (this.licenseOptions.length === 0) {
      this.initLicenses();
    }
  }

  componentDidMount() {
    this.attachBootstrap();
  }

  componentDidUpdate() {
    this.attachBootstrap();
  }

  initLicenses() {
    const { licenses, tags } = this.props;

    for (const license of licenses) {
      // gather tag presentation data
      const {shortText, longText, fixedText} = license.tags
        .map((name) => tags[name].presentation || {})
        .reduce((acc, curr) => ({
          shortText: acc.shortText.concat(curr.shortText && [curr.shortText] || []),
          longText: acc.longText.concat(curr.longText && [curr.longText] || []),
          fixedText: acc.fixedText || curr.fixedText,
        }), {shortText: [], longText: []} as any);

      // create a dropdown option
      const entry = {label: license.name, value: license.name,
        tags: license.tags, shortText, longText, fixedText};
      this.licenseOptions.push(entry);
      this.licenseMap[license.name] = entry;
    }
  }

  attachBootstrap() {
    $('[data-toggle="tooltip"]').tooltip({placement: 'bottom', container: 'body'});
  }

  propagateState(state: Partial<State>) {
    this.setState(state as any, () => {
      if (this.state.selectedPackage == null) {
        this.props.onChange(null);
      } else {
        this.props.onChange({
          ...this.state.pkg,
        });
      }
    });
  }

  debouncedSearch = debounce((input: string) => {
    this.props.dispatch(PackageActions.searchPackages(input));
  }, 200);

  searchPackages = (input: string) => {
    if (input == null || input.length === 0) {
      return;
    }

    this.debouncedSearch(input);
  }

  filterPackageList = (options, filter) => {
    if (!filter || filter.length === 0) {
      return options;
    }

    return [
      ...options,
      {value: filter, label: `Create package ${filter}`, create: true},
    ];
  }

  mapPackageCompletions = () => {
    return this.props.completions.map((item) => {
      return {
        value: item.packageId,
        label: `${item.name} (${item.version})`,
      };
    });
  }

  isCreating = () => {
    return this.state.pkg.packageId == null;
  }

  handlePackageChange = (selected) => {
    // empty input? clear it all
    if (selected == null || selected.value === '') {
      this.propagateState({pkg: {}, selectedPackage: null});
      return;
    }

    const isCreating = selected.create === true;

    if (isCreating) {
      this.propagateState({
        selectedPackage: selected,
        pkg: {
          name: selected.value,
          version: '',
          website: '',
          license: '',
          licenseText: '',
          copyright: '',
        },
      });
    } else {
      const pkg = this.props.packages[selected.value];
      this.propagateState({
        selectedPackage: selected,
        pkg: {
          packageId: pkg.packageId,
          name: pkg.name,
          version: pkg.version,
          website: pkg.website,
          license: pkg.license,
          licenseText: pkg.licenseText || '',
          copyright: pkg.copyright,
        },
      });
    }
  }

  handleChange = (e) => {
    const val = e.target.value;

    this.propagateState({pkg: {
      ...this.state.pkg,
      [e.target.name]: val,
    }});
  }

  handleLicenseChange = (selected: LicenseOption) => {
    this.propagateState({pkg: {
      ...this.state.pkg,
      license: selected ? selected.value as string : null,
    }});
  }

  needsFullLicense = () => {
    const sel = this.licenseMap[this.state.pkg.license];

    // we want to show the full license box if a license wasn't entered,
    // or if we don't know it
    if (sel == null) {
      return true;
    }

    // dont require text if the license is fixed
    if (sel.fixedText) {
      return false;
    }

    return true;
  }

  licenseOptionRenderer = (option: LicenseOption) => {
    if (option.shortText) {
      return <span>{option.label} {option.shortText.join(' ')}</span>;
    }
    return <span>{option.label}</span>;
  }

  largeCopyrightStatement = () => {
    return this.state.pkg.copyright.split(/\n/).length > 5;
  }

  render() {
    return <div>
      <div className="form-group" id="package-container">
        <label htmlFor="package">Package</label>
        <Select
          name="package"
          value={this.state.selectedPackage}
          options={this.mapPackageCompletions()}
          onInputChange={this.searchPackages}
          filterOptions={this.filterPackageList}
          onChange={this.handlePackageChange}
        />
      </div>

      {this.state.selectedPackage == null ?
        <p>
          Search for a package above or create it by typing in its name<br/><br/>
        </p>
      : this.renderDetails()}
    </div>;
  }

  renderDetails() {
    const { pkg } = this.state;
    const needsFullLicense = this.needsFullLicense();
    const largeCopyrightStatement = this.largeCopyrightStatement();
    const license: Partial<LicenseOption> = this.licenseMap[pkg.license] ||
                                            {label: pkg.license, value: pkg.license};

    return <div className="row">

      <div className="col-md-6">
        {this.isCreating() &&
          <div className="form-group">
            <label htmlFor="packageVersion">Version</label>
            <input type="text" name="version" id="packageVersion" className="form-control"
              value={pkg.version} onChange={this.handleChange} />
          </div>
        }

        <div className="form-group">
          <label htmlFor="packageLicense">License</label>
          <FreeformSelect
            name="license"
            value={license}
            options={this.licenseOptions}
            optionRenderer={this.licenseOptionRenderer}
            placeholder="Select a license or paste the full text below."
            onChange={this.handleLicenseChange}
          />
          {license.longText && <span className="form-text text-muted">{license.longText.join('\n')}</span>}
        </div>
        {needsFullLicense ? (
          <div className="form-group">
            <textarea name="licenseText" id="packageLicenseText" className="form-control"
              onChange={this.handleChange} value={pkg.licenseText}
              placeholder="Paste the full license text here." />
          </div>
        ) : ''}
      </div>

      <div className="col-md-6">
        <div className="form-group">
          <label htmlFor="packageWebsite">Website</label>
          <input type="text" name="website" id="packageWebsite" className="form-control"
            onChange={this.handleChange} value={pkg.website} />
        </div>

        <div className={largeCopyrightStatement ? 'form-group has-warning' : 'form-group'}>
          <label htmlFor="packageCopyright">Copyright statement / notice</label>{' '}
          <i className="fa fa-question-circle" data-toggle="tooltip"
            title={'A copyright statement usually looks like \'Copyright (c) 20xx Some Person\' ' +
            'and is generally only 1-5 lines. Some packages include extra information in a NOTICE file, ' +
            'which you should include here as well.'} />
          <textarea name="copyright" id="packageCopyright" className="form-control"
            onChange={this.handleChange} value={pkg.copyright}
            placeholder="Paste any copyright statements or NOTICE files here." />
          {largeCopyrightStatement && <span className="form-text text-muted">
            This copyright statement (or notice file) looks a little long.
            This is fine if it's correct, but please double-check that it isn't the license text instead.
            Licenses should go in the previous section.
          </span>}
        </div>
      </div>
    </div>;
  }

}

export default connect((state) => ({
  completions: state.packages.completions,
  packages: state.packages.set,
  licenses: state.licenses.list,
  tags: state.licenses.tags,
}))(PackageFields as any) as React.ComponentClass<Partial<Props>>;
