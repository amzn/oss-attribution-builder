// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React = require('react');
import { connect } from 'react-redux';
import Select, { Option } from 'react-select';

import { WebLicense, WebTag } from '../../../../server/api/v1/licenses/interfaces';
import { WebPackage } from '../../../../server/api/v1/packages/interfaces';
import * as LicenseActions from '../../../modules/licenses';
import * as PackageActions from '../../../modules/packages';
import debounce from '../../../util/debounce';
import FreeformSelect from '../../util/FreeformSelect';

export type PkgOutput = Partial<WebPackage>;

interface OwnProps {
  initial?: Partial<WebPackage>;
  onChange?: (usage?: PkgOutput) => void;
}

interface Props extends OwnProps {
  dispatch: (action: any) => any;
  completions: WebPackage[];
  packages: PackageActions.PackageSet;
  licenses: WebLicense[];
  tags: { [key: string]: WebTag };
}

interface State {
  pkg: Partial<WebPackage>;
  selectedPackage?: PackageOption;
}

interface PackageOption extends Option {
  name: string;
  version: string;
}

interface LicenseOption extends Option {
  tags: string[];
  shortText?: string[];
  longText?: string[];
  fixedText: boolean;
}

class PackageFields extends React.Component<Props, State> {
  licenseOptions: LicenseOption[] = [];
  licenseMap: { [name: string]: LicenseOption } = {};

  static defaultProps = {
    initial: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      pkg: { ...this.props.initial },
      selectedPackage: undefined,
    };
  }

  componentWillMount() {
    const { dispatch, licenses } = this.props;
    if (licenses.length === 0) {
      dispatch(LicenseActions.fetchLicenses());
    }
  }

  componentDidMount() {
    this.attachBootstrap();
    this.setInitialPackage();
  }

  componentDidUpdate() {
    this.attachBootstrap();
  }

  initLicenses() {
    const { licenses, tags } = this.props;

    if (licenses.length === 0 || this.licenseOptions.length > 0) {
      return;
    }

    for (const license of licenses) {
      // gather tag presentation data
      const { shortText, longText, fixedText } = license.tags
        .map(name => tags[name].presentation || {})
        .reduce(
          (acc, curr) => ({
            shortText: acc.shortText.concat(
              (curr.shortText && [curr.shortText]) || []
            ),
            longText: acc.longText.concat(
              (curr.longText && [curr.longText]) || []
            ),
            fixedText: acc.fixedText || curr.fixedText,
          }),
          { shortText: [], longText: [] } as any
        );

      // create a dropdown option
      const entry = {
        label: license.name,
        value: license.name,
        tags: license.tags,
        shortText,
        longText,
        fixedText,
      };
      this.licenseOptions.push(entry);
      this.licenseMap[license.name] = entry;
    }
  }

  attachBootstrap() {
    $('[data-toggle="tooltip"]').tooltip({
      placement: 'bottom',
      container: 'body',
    });
  }

  propagateState(state: Partial<State>) {
    this.setState(state as State, () => {
      if (this.props.onChange == undefined) {
        return;
      }
      if (this.state.selectedPackage == undefined) {
        this.props.onChange();
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
    if (input == undefined || input.length === 0) {
      return;
    }

    this.debouncedSearch(input);
  };

  filterPackageList = (options, filter) => {
    if (!filter || filter.length === 0) {
      return options;
    }

    return [...options, { value: filter, label: filter, create: true }];
  };

  packageOptionRenderer = (option: PackageOption) => {
    if (option.create) {
      return (
        <span className="create-package-option">
          Create package <strong>{option.value}</strong>
        </span>
      );
    }

    return (
      <span className="package-option">
        {option.name} <small>{option.version}</small>
      </span>
    );
  };

  mapPackageCompletions = () => {
    return this.props.completions.map(item => {
      return {
        value: item.packageId,
        label: `${item.name} (${item.version})`,
        name: item.name,
        version: item.version,
      };
    });
  };

  setInitialPackage = () => {
    const { initial, packages } = this.props;
    if (initial == undefined || initial.packageId == undefined) {
      return;
    }

    if (this.state.selectedPackage != undefined) {
      return;
    }

    const pkg = packages[initial.packageId];
    if (pkg == undefined) {
      return;
    }

    this.handlePackageChange({
      label: `Editing ${pkg.name}`,
      value: initial.packageId,
      name: pkg.name,
      version: pkg.version,
    });
  };

  handlePackageChange = (selected?: PackageOption) => {
    // empty input? clear it all
    if (selected == undefined || selected.value === '') {
      this.propagateState({ pkg: {}, selectedPackage: undefined });
      return;
    }

    const value = selected.value as number;

    const isCreating = selected.create === true;
    if (isCreating) {
      this.propagateState({
        selectedPackage: selected,
        pkg: {
          name: selected.value as string, // value is a string when accepting custom input
          version: '',
          website: '',
          license: '',
          licenseText: '',
          copyright: '',
        },
      });
    } else {
      const pkg = this.props.packages[value];
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
  };

  handleChange = e => {
    const val = e.target.value;
    this.propagateState({
      pkg: {
        ...this.state.pkg,
        [e.target.name]: val,
      },
    });
  };

  handleLicenseChange = (selected: LicenseOption) => {
    this.propagateState({
      pkg: {
        ...this.state.pkg,
        license: selected ? (selected.value as string) : undefined,
      },
    });
  };

  needsFullLicense = () => {
    if (this.state.pkg.license == undefined) {
      return true;
    }

    const sel = this.licenseMap[this.state.pkg.license];

    // we want to show the full license box if a license wasn't entered,
    // or if we don't know it
    if (sel == undefined) {
      return true;
    }

    // dont require text if the license is fixed
    if (sel.fixedText) {
      return false;
    }

    return true;
  };

  licenseOptionRenderer = (option: LicenseOption) => {
    if (option.shortText) {
      return (
        <span>
          {option.label} {option.shortText.join(' ')}
        </span>
      );
    }
    return <span>{option.label}</span>;
  };

  largeCopyrightStatement = () => {
    return (
      this.state.pkg.copyright != undefined &&
      this.state.pkg.copyright.split(/\n/).length > 5
    );
  };

  render() {
    return (
      <div>
        <div className="form-group" id="package-container">
          <label htmlFor="package">Package</label>
          <Select
            name="package"
            value={this.state.selectedPackage || undefined}
            options={this.mapPackageCompletions()}
            optionRenderer={this.packageOptionRenderer as any}
            valueRenderer={this.packageOptionRenderer as any}
            onInputChange={this.searchPackages}
            filterOptions={this.filterPackageList}
            onChange={this.handlePackageChange as any}
          />
        </div>

        {this.state.selectedPackage == undefined ? (
          <p>
            Search for a package above or create it by typing in its name
            <br />
            <br />
          </p>
        ) : (
          this.renderDetails()
        )}
      </div>
    );
  }

  renderDetails() {
    const { pkg } = this.state;
    this.initLicenses();

    const needsFullLicense = this.needsFullLicense();
    const largeCopyrightStatement = this.largeCopyrightStatement();
    const license: Partial<LicenseOption> = this.licenseMap[pkg.license!] || {
      label: pkg.license!,
      value: pkg.license!,
    };

    return (
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="packageVersion">Version</label>
            <input
              type="text"
              name="version"
              id="packageVersion"
              className="form-control"
              value={pkg.version}
              onChange={this.handleChange}
            />
          </div>

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
            {license.longText && (
              <span className="form-text text-muted">
                {license.longText.join('\n')}
              </span>
            )}
          </div>
          {needsFullLicense ? (
            <div className="form-group">
              <textarea
                name="licenseText"
                id="packageLicenseText"
                className="form-control"
                onChange={this.handleChange}
                value={pkg.licenseText}
                placeholder="Paste the full license text here."
              />
            </div>
          ) : (
            ''
          )}
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="packageWebsite">Website</label>
            <input
              type="text"
              name="website"
              id="packageWebsite"
              className="form-control"
              onChange={this.handleChange}
              value={pkg.website}
            />
          </div>

          <div
            className={
              largeCopyrightStatement ? 'form-group has-warning' : 'form-group'
            }
          >
            <label htmlFor="packageCopyright">
              Copyright statement / notice
            </label>{' '}
            <i
              className="fa fa-question-circle"
              data-toggle="tooltip"
              title={
                "A copyright statement usually looks like 'Copyright (c) 20xx Some Person' " +
                'and is generally only 1-5 lines. Some packages include extra information in a NOTICE file, ' +
                'which you should include here as well.'
              }
            />
            <textarea
              name="copyright"
              id="packageCopyright"
              className="form-control"
              onChange={this.handleChange}
              value={pkg.copyright}
              placeholder="Paste any copyright statements or NOTICE files here."
            />
            {largeCopyrightStatement && (
              <span className="form-text text-muted">
                This copyright statement (or notice file) looks a little long.
                This is fine if it's correct, but please double-check that it
                isn't the license text instead. Licenses should go in the
                previous section.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state: any, props: OwnProps) => ({
  completions: state.packages.completions,
  packages: state.packages.set,
  licenses: state.licenses.list,
  tags: state.licenses.tags,
}))(PackageFields);
