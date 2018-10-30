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
export const RECEIVE_PROJECT_REF_INFO = 'app/projects/receive-project-ref-info';

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

  /**
   * An attribution document structure.
   */
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

    case RECEIVE_PROJECT_REF_INFO:
      return Object.assign({}, state, {
        active: {
          ...state.active,
          refInfo: {
            refs: action.refs,
            reverseRefs: action.reverseRefs,
          },
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

export function receiveRefInfo(info) {
  // turn these arrays into objects
  const refs = info.refs.reduce(
    (acc, curr) => {
      acc[curr.projectId] = curr;
      return acc;
    },
    {} as any
  );
  const reverseRefs = info.reverseRefs.reduce(
    (acc, curr) => {
      acc[curr.projectId] = curr;
      return acc;
    },
    {} as any
  );
  return {
    type: RECEIVE_PROJECT_REF_INFO,
    refs,
    reverseRefs,
  };
}

/*** Bound action creators ***/

/**
 * Fetch projects. Updates state & dispatches when complete.
 */
export function fetchProjects(queryString) {
  return async dispatch => {
    const response = await fetchAuth(`/api/projects/${queryString}`);
    const json = await response.json();
    return dispatch(receiveProjects(json));
  };
}

/**
 * Fetch a single project by ID.
 */
export function fetchProjectDetail(projectId) {
  return async dispatch => {
    const response = await fetchAuth(`/api/projects/${projectId}`);
    const json = await response.json();
    return dispatch(receiveProjectDetail(json));
  };
}

/**
 * Submit a new project with some initial details.
 */
export function createProject(details: Partial<WebProject>) {
  return async dispatch => {
    const json = await reqJSON('/api/projects/new', details);
    return history.push(`/projects/${json.projectId}`);
  };
}

/**
 * Patch a project with a set of updates.
 */
export function patchProject(projectId, changes: Partial<WebProject>) {
  return async dispatch => {
    await reqJSON(`/api/projects/${projectId}`, changes, 'PATCH');
    return dispatch(fetchProjectDetail(projectId));
  };
}

/**
 * Attach a (new or existing) package to a project. Reloads the project on completion.
 */
export function attachPackageToProject(projectId, packageInfo) {
  return async dispatch => {
    await reqJSON(`/api/projects/${projectId}/attach`, packageInfo);
    return dispatch(fetchProjectDetail(projectId));
  };
}

/**
 * Remove a package from a project. Does not delete the package.
 */
export function detachPackageFromProject(projectId: string, packageId: number) {
  return async dispatch => {
    await reqJSON(`/api/projects/${projectId}/detach`, { packageId });
    return dispatch(fetchProjectDetail(projectId));
  };
}

export function replacePackageForProject(
  projectId: string,
  oldId: number,
  newId: number
) {
  return async dispatch => {
    await reqJSON(`/api/projects/${projectId}/replace`, { oldId, newId });
    return dispatch(fetchProjectDetail(projectId));
  };
}

/**
 * Request an attribution document and any warnings it generates.
 */
export function buildAttributionDoc(projectId) {
  return async dispatch => {
    const response = await fetchAuth(`/api/projects/${projectId}/build`);
    const json = await response.json();
    return dispatch(receiveAttributionDoc(json));
  };
}

/**
 * Permanently store an attribution document.
 */
export function storeAttributionDoc(projectId) {
  return async dispatch => {
    const json = await reqJSON(`/api/projects/${projectId}/build`);
    return downloadText(`THIRD-PARTY-LICENSES_${projectId}.txt`, json.text);
  };
}

/**
 * Clone a project.
 */
export function cloneProject(
  projectId: string,
  newDetails: Pick<WebProject, 'title' | 'version' | 'acl'>
) {
  return async dispatch => {
    const json = await reqJSON(`/api/projects/${projectId}/clone`, newDetails);
    history.push(`/projects/${json.projectId}`);
  };
}

/**
 * Create a project reference
 */
export function createRef(
  projectId: string,
  targetProjectId: string,
  type: 'includes' | 'related',
  comment: string
) {
  return async dispatch => {
    await reqJSON(`/api/projects/${projectId}/refs`, {
      targetProjectId,
      type,
      comment,
    });
  };
}

export function getRefInfo(projectId: string) {
  return async dispatch => {
    const refInfo = await reqJSON(
      `/api/projects/${projectId}/refs`,
      undefined,
      'GET'
    );
    dispatch(receiveRefInfo(refInfo));
  };
}
