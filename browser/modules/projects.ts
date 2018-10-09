// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as moment from 'moment';

import { WebProject } from '../../server/api/projects/interfaces';
import history from '../history';
import { fetchAuth, reqJSON } from '../util';
import { downloadText } from '../util/download';

export const RECEIVE_PROJECTS = 'app/projects/receive-projects';
export const RECEIVE_PROJECT_DETAIL = 'app/projects/receive-project-detail';
export const RECEIVE_ATTRIBUTION_DOC = 'app/projects/receive-attribution-doc';

const initial = {
  /**
   * Contains a list of loaded project IDs and titles.
   *
   * Complete project details are not loaded; see `activeProject` for that.
   */
  list: [],

  /**
   * Represents the project currently displayed on the page.
   *  {
   *    title: "",
   *    description: "",
   *    createdOn: Date,
   *    packagesUsed: [
   *      {packageId: 1, notes: "", ...},
   *      ...
   *    ],
   *    ...
   *  }
   */
  active: {},

  attributionDoc: {
    text: '',
    lines: [],
    annotations: [],
    warnings: [],
  },
};

export default function reducer(state = initial, action: any = {}) {
  switch (action.type) {
    case RECEIVE_PROJECTS:
      return Object.assign({}, state, {
        list: action.projects,
      });

    case RECEIVE_PROJECT_DETAIL:
      return Object.assign({}, state, {
        active: {
          ...state.active,
          ...action.project,
        },
      });

    case RECEIVE_ATTRIBUTION_DOC:
      return Object.assign({}, state, {
        attributionDoc: {
          ...state.attributionDoc,
          ...action.doc,
        },
      });

    default:
      return state;
  }
}

/*** Action creators ***/

export function receiveProjects(projects) {
  return {
    type: RECEIVE_PROJECTS,
    projects,
  };
}

export function receiveProjectDetail(project) {
  project.createdOn = moment(project.createdOn);
  project.plannedRelease = moment.utc(project.plannedRelease); // this is just a date; no localtime wanted
  return {
    type: RECEIVE_PROJECT_DETAIL,
    project,
  };
}

export function receiveAttributionDoc(data) {
  data.lines = data.text.split(/\r?\n/);
  return {
    type: RECEIVE_ATTRIBUTION_DOC,
    doc: data,
  };
}

/*** Bound action creators ***/

/**
 * Fetch projects. Updates state & dispatches when complete.
 */
export function fetchProjects(queryString) {
  return dispatch => {
    return fetchAuth(`/api/projects/${queryString}`)
      .then(response => response.json())
      .then(json => dispatch(receiveProjects(json)));
  };
}

/**
 * Fetch a single project by ID.
 */
export function fetchProjectDetail(projectId) {
  return dispatch => {
    return fetchAuth(`/api/projects/${projectId}`)
      .then(response => response.json())
      .then(json => dispatch(receiveProjectDetail(json)));
  };
}

/**
 * Submit a new project with some initial details.
 */
export function createProject(details: Partial<WebProject>) {
  return dispatch => {
    return reqJSON('/api/projects/new', details).then(json =>
      history.push(`/projects/${json.projectId}`)
    );
  };
}

/**
 * Patch a project with a set of updates.
 */
export function patchProject(projectId, changes: Partial<WebProject>) {
  return dispatch => {
    return reqJSON(`/api/projects/${projectId}`, changes, 'PATCH').then(json =>
      dispatch(fetchProjectDetail(projectId))
    );
  };
}

/**
 * Attach a (new or existing) package to a project. Reloads the project on completion.
 */
export function attachPackageToProject(projectId, packageInfo) {
  return dispatch => {
    return reqJSON(`/api/projects/${projectId}/attach`, packageInfo).then(() =>
      dispatch(fetchProjectDetail(projectId))
    );
  };
}

/**
 * Remove a package from a project. Does not delete the package.
 */
export function detachPackageFromProject(projectId: string, packageId: number) {
  return dispatch => {
    return reqJSON(`/api/projects/${projectId}/detach`, { packageId }).then(
      () => dispatch(fetchProjectDetail(projectId))
    );
  };
}

export function replacePackageForProject(
  projectId: string,
  oldId: number,
  newId: number
) {
  return dispatch => {
    return reqJSON(`/api/projects/${projectId}/replace`, { oldId, newId }).then(
      () => dispatch(fetchProjectDetail(projectId))
    );
  };
}

/**
 * Request an attribution document and any warnings it generates.
 */
export function buildAttributionDoc(projectId) {
  return dispatch => {
    return fetchAuth(`/api/projects/${projectId}/build`)
      .then(response => response.json())
      .then(json => dispatch(receiveAttributionDoc(json)));
  };
}

/**
 * Permanently store an attribution document.
 */
export function storeAttributionDoc(projectId) {
  return dispatch => {
    return reqJSON(`/api/projects/${projectId}/build`).then(json =>
      downloadText(`THIRD-PARTY-LICENSES_${projectId}.txt`, json.text)
    );
  };
}

/**
 * Clone a project.
 */
export function cloneProject(projectId: string, newDetails: Pick<WebProject, 'title' | 'version' | 'acl'>) {
  return async dispatch => {
    const json = await reqJSON(`/api/projects/${projectId}/clone`, newDetails);
    history.push(`/projects/${json.projectId}`);
  };
}