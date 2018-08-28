/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { CMBeat } from '../../../common/domain_types';
import { FrameworkRequest } from '../../lib/adapters/framework/adapter_types';
import { CMServerLibs } from '../../lib/lib';
import { wrapEsError } from '../../utils/error_wrappers';

// TODO: add license check pre-hook
export const createListAgentsRoute = (libs: CMServerLibs) => ({
  method: 'GET',
  path: '/api/beats/agents/{listByAndValue*}',
  handler: async (request: FrameworkRequest, reply: any) => {
    const listByAndValueParts = request.params.listByAndValue.split('/');
    let listBy: 'tag' | null = null;
    let listByValue: string | null = null;

    if (listByAndValueParts.length === 2) {
      listBy = listByAndValueParts[0];
      listByValue = listByAndValueParts[1];
    }

    try {
      let beats: CMBeat[];
      switch (listBy) {
        case 'tag':
          beats = await libs.beats.getAllWithTag(request.user, listByValue || '');
          break;

        default:
          beats = await libs.beats.getAll(request.user);

          break;
      }

      reply({ beats });
    } catch (err) {
      // TODO move this to kibana route thing in adapter
      return reply(wrapEsError(err));
    }
  },
});
