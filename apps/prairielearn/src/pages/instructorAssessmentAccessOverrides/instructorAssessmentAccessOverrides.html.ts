import { z } from 'zod';

import { html } from '@prairielearn/html';
import { renderEjs } from '@prairielearn/html-ejs';

import { compiledScriptTag } from '../../lib/assets.js';
import { IdSchema } from '../../lib/db-types.js';

export const AssessmentAccessPolicyRowSchema = z.object({
  // TODO: do date formatting in JS
  created_at: z.string(),
  created_by: z.string(),
  credit: z.string(),
  end_date: z.string(),
  note: z.string().nullable(),
  start_date: z.string(),
  group_name: z.string().nullable(),
  student_uid: z.string().nullable(),
  id: IdSchema,
});
export type AssessmentAccessPolicyRow = z.infer<typeof AssessmentAccessPolicyRowSchema>;

export function InstructorAssessmentAccessOverrides({
  policies,
  timezone,
  resLocals,
}: {
  policies: AssessmentAccessPolicyRow[];
  timezone: string;
  resLocals: Record<string, any>;
}) {
  // TODO: inline the page name and such for the head/nav partials.
  return html`
    <!doctype html>
    <html lang="en">
      <head>
        ${renderEjs(import.meta.url, "<%- include('../partials/head'); %>", {
          ...resLocals,
          pageTitle: 'Access overrides',
        })}
        ${compiledScriptTag('instructorAssessmentAccessOverridesClient.ts')}
      </head>
      <body>
        ${renderEjs(import.meta.url, "<%- include('../partials/navbar'); %>", {
          ...resLocals,
          navSubPage: 'access_overrides',
        })}
        <main id="content" class="container-fluid">
          <div class="card mb-4">
            <div
              class="card-header bg-primary text-white d-flex align-items-center justify-content-between"
            >
              Access Overrides - ${resLocals.assessment.title}
              ${resLocals.authz_data.has_course_instance_permission_edit
                ? html`
                    <button
                      type="button"
                      class="btn btn-light"
                      data-toggle="modal"
                      data-target="#addPolicyModal"
                    >
                      Add <i class="fas fa-plus"></i>
                    </button>
                  `
                : ''}
            </div>
            <div
              class="modal fade"
              id="addPolicyModal"
              tabindex="-1"
              role="dialog"
              aria-labelledby="addPolicyModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <form id="add-new-override" method="POST">
                    <div class="modal-header">
                      <h5 class="modal-title" id="addPolicyModalLabel">Add New Override</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <input type="hidden" name="__action" value="add_new_override" />
                      <input type="hidden" name="__csrf_token" value="${resLocals.__csrf_token}" />
                      ${resLocals.assessment.group_work
                        ? html`
                            <div class="form-group">
                              <label for="group_id">Group Name</label>
                              <input
                                type="text"
                                class="form-control"
                                id="group_name"
                                name="group_name"
                                required
                              />
                            </div>
                          `
                        : html`
                            <div class="form-group">
                              <label for="student_uid">Student UID</label>
                              <input
                                type="text"
                                class="form-control"
                                id="student_uid"
                                name="student_uid"
                                placeholder="student@example.com"
                                required
                              />
                            </div>
                          `}
                      <div class="form-group">
                        <label for="start_date">Start Date</label>
                        <div class="input-group">
                          <input
                            type="datetime-local"
                            class="form-control"
                            id="start_date"
                            name="start_date"
                            step="1"
                            required
                          />
                          <div class="input-group-append">
                            <span class="input-group-text">(${timezone})</span>
                          </div>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="end_date">End Date</label>
                        <div class="input-group">
                          <input
                            type="datetime-local"
                            class="form-control"
                            id="end_date"
                            name="end_date"
                            step="1"
                            required
                          />
                          <div class="input-group-append">
                            <span class="input-group-text">(${timezone})</span>
                          </div>
                        </div>
                        <div
                          id="end_date_error"
                          class="invalid-feedback"
                          style="display: none; color: red;"
                        ></div>
                      </div>
                      <div class="form-group">
                        <label for="credit">Credit</label>
                        <div class="input-group">
                          <input
                            type="number"
                            class="form-control"
                            id="credit"
                            name="credit"
                            min="0"
                            required
                          />
                          <div class="input-group-append">
                            <span class="input-group-text">%</span>
                          </div>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="note">Note</label>
                        <textarea class="form-control" id="note" name="note"></textarea>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">
                        Close
                      </button>
                      <button type="submit" class="btn btn-primary">Submit</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div
              class="modal fade"
              id="editPolicyModal"
              tabindex="-1"
              role="dialog"
              aria-labelledby="editPolicyModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <form id="edit-override-form" method="POST">
                    <div class="modal-header">
                      <h5 class="modal-title" id="editPolicyModalLabel">Edit Override</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <input type="hidden" name="__action" value="edit_override" />
                      <input type="hidden" name="__csrf_token" value="${resLocals.__csrf_token}" />
                      <input type="hidden" name="policy_id" id="policy_id" />

                      ${resLocals.assessment.group_work
                        ? html`
                            <div class="form-group">
                              <label for="group_name">Group Name</label>
                              <input
                                type="text"
                                class="form-control"
                                id="edit-group_name"
                                name="group_name"
                              />
                              <div
                                id="edit-group_name_error"
                                class="invalid-feedback"
                                style="display: none; color: red;"
                              ></div>
                            </div>
                          `
                        : html`
                            <div class="form-group">
                              <label for="student_uid">Student UID</label>
                              <input
                                type="text"
                                class="form-control"
                                id="edit-student_uid"
                                name="student_uid"
                              />
                            </div>
                          `}

                      <div class="form-group">
                        <label for="edit-start_date">Start Date</label>
                        <div class="input-group">
                          <input
                            type="datetime-local"
                            class="form-control"
                            id="edit-start_date"
                            name="start_date"
                            step="1"
                            required
                          />
                          <div class="input-group-append">
                            <span class="input-group-text">(${timezone})</span>
                          </div>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="edit-end_date">End Date</label>
                        <div class="input-group">
                          <input
                            type="datetime-local"
                            class="form-control"
                            id="edit-end_date"
                            name="end_date"
                            step="1"
                            required
                          />
                          <div class="input-group-append">
                            <span class="input-group-text">(${timezone})</span>
                          </div>
                        </div>
                        <div
                          id="edit-end_date_error"
                          class="invalid-feedback"
                          style="display: none; color: red;"
                        ></div>
                      </div>
                      <div class="form-group">
                        <label for="edit-credit">Credit</label>
                        <input type="number" class="form-control" id="edit-credit" name="credit" />
                      </div>
                      <div class="form-group">
                        <label for="edit-note">Note</label>
                        <textarea class="form-control" id="edit-note" name="note"></textarea>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">
                        Close
                      </button>
                      <button type="submit" class="btn btn-primary" form="edit-override-form">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-sm table-hover">
                <thead>
                  <tr>
                    <th>${resLocals.assessment.group_work ? 'Group Name' : 'Student UID'}</th>
                    <th>Created At</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Created By</th>
                    <th>Credit</th>
                    <th>Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${policies.map(
                    (policy) => html`
                      <tr>
                        <td>
                          ${resLocals.assessment.group_work
                            ? policy.group_name
                            : policy.student_uid}
                        </td>
                        <td>${policy.created_at}</td>
                        <td>${policy.start_date}</td>
                        <td>${policy.end_date}</td>
                        <td>${policy.created_by}</td>
                        <td>${policy.credit + '%'}</td>
                        <td>${policy.note ?? html`&mdash;`}</td>
                        <td>
                          ${resLocals.authz_data.has_course_instance_permission_edit
                            ? html`
                                <div class="dropdown js-question-actions">
                                  <button
                                    class="btn btn-xs btn-secondary dropdown-toggle"
                                    type="button"
                                    data-toggle="dropdown"
                                    data-container="body"
                                    data-html="true"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    data-boundary="window"
                                  >
                                    Action
                                  </button>
                                  <div class="dropdown-menu">
                                    <button
                                      type="button"
                                      class="dropdown-item edit-override-button"
                                      data-user-id="${policy.student_uid}"
                                      data-group-name="${policy.group_name}"
                                      data-credit="${policy.credit}"
                                      data-start-date="${policy.start_date}"
                                      data-end-date="${policy.end_date}"
                                      data-note="${policy.note}"
                                      data-policy-id="${policy.id}"
                                    >
                                      <i class="fas fa-edit"></i> Edit
                                    </button>

                                    <button
                                      type="button"
                                      class="dropdown-item delete-button"
                                      data-toggle="modal"
                                      data-target="#deleteModal"
                                      data-policy-id="${policy.id}"
                                    >
                                      <i class="fas fa-remove"></i> Delete
                                    </button>
                                  </div>
                                </div>
                              `
                            : ''}
                        </td>
                      </tr>
                    `,
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <!-- Modal dialog for delete confirmation -->
          <div
            class="modal fade"
            id="deleteModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="deleteModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <form name="delete-override-form" method="POST">
                  <div class="modal-header">
                    <h5 class="modal-title" id="deleteModalLabel">Confirm Delete</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <p>Are you sure you want to delete this Access Override?</p>
                  </div>
                  <div class="modal-footer">
                    <input type="hidden" name="__action" value="delete_override" />
                    <input type="hidden" name="__csrf_token" value="${resLocals.__csrf_token}" />
                    <input type="hidden" name="policy_id" class="js-policy-id" />
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">
                      Cancel
                    </button>
                    <button class="btn btn-danger">Delete</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  `.toString();
}
