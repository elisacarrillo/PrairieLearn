const error = require('@prairielearn/error');
const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const {loadSqlEquiv} = require('@prairielearn/postgres');
const sqldb = require('@prairielearn/postgres');
const sql = loadSqlEquiv(__filename);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const params = {
      assessment_id: res.locals.assessment.id,
      current_student_uid: res.locals.user.uid,
      current_assessment_title : res.locals.assessment.title
    };
    const result = await sqldb.queryAsync(sql.select_assessment_access_policy, params);
    res.locals.policies = result.rows
    // console.log(convertToTimeZone(new Date() , res.locals.course_instance.display_timezone))
    // console.log("Res: " + JSON.stringify(res.locals.course_instance));
    res.render(__filename.replace(/\.js$/, '.ejs'), {
      policies: res.locals.policies,
      assessment_id: params.assessment_id,
      current_student_uid: params.current_student_uid,
      current_assessment_title: params.current_assessment_title,
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    if (req.body.__action === 'add_new_override') {
    const params = {
      assessment_id: res.locals.assessment.id,
      // created_at: convertToTimeZone(new Date() , res.locals.course_instance.display_timezone),
      created_by: res.locals.user.uid,
      credit: req.body.credit,
      end_date: new Date(req.body.end_date),
      group_name: req.body.group_name || null,
      note: req.body.note || null,
      start_date: new Date(req.body.start_date),
      // type: req.body.type,
      student_uid: req.body.student_uid,
    };
     // First, validate if group belongs to the assessment
     const group_result = await sqldb.queryAsync(sql.select_group_in_assessment, {
      group_name: params.group_name,
      course_instance_id: res.locals.course_instance.id,
      assessment_id: res.locals.assessment.id
    });

    // Get the group_id from the result
    params.group_id = group_result.rows[0].id;
    
    // If group does not belong to course instance, return error
    if (group_validation_result.rows[0].count === 0) {
      throw error.make(400, 'Group does not belong to the current course instance.'); 
    }
    await sqldb.queryAsync(sql.insert_assessment_access_policy, params);
    res.redirect(req.originalUrl);
  
  } 
  
  else if (req.body.__action === 'delete_override')
    {
      const delete_params = {
        assessment_id: res.locals.assessment.id,
        student_uid: req.body.student_uid,
        group_name: req.body.group_name,
      };
      // const result_after_delete = await sqldb.queryAsync(deleteQuery, delete_params);
      // console.log(result_after_delete)
      const result_after_delete = await sqldb.queryAsync(sql.delete_assessment_access_policy, delete_params);
      console.log(result_after_delete.rows)
      res.locals.policies = result_after_delete.rows;
      res.redirect(req.originalUrl);
    }

    else if (req.body.__action === 'edit_override') {
      const edit_params = {
        assessment_id: res.locals.assessment.id,
        // created_at: convertToTimeZone(new Date() , res.locals.course_instance.display_timezone),
        created_by: res.locals.user.uid,
        credit: req.body.credit,
        end_date: new Date(req.body.end_date),
        group_name: req.body.group_name || null,
        note: req.body.note || null,
        start_date: new Date(req.body.start_date),
        student_uid: req.body.student_uid,
      };
      await sqldb.queryAsync(sql.update_assessment_access_policy, edit_params);
      res.redirect(req.originalUrl);
    }
  })
);


module.exports = router;
