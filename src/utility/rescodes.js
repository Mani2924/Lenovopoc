const rescodes = {
  wentWrong: {
    codes: 'wentWrong',
    value: 'Something Went Wrong',
    html: 'Something Went Wrong',
  },
  success: {
    codes: 'success',
    value: 'Success!',
    html: 'Success!',
  },
  forbidden: {
    codes: 'forbidden',
    value: 'forbidden!',
    html: 'forbidden!',
  },
  unAuthorized: {
    codes: 'unAuthorized',
    value: 'Unauthorized!',
    html: 'Unauthorized!',
  },
  tagsNotExists: {
    codes: 'tagsNotExists',
    value: 'Tags does not exists',
    html: 'Tags does not exists',
  },
  assessmentExist: {
    codes: 'assessmentExist',
    value: 'Assessment Already Exist',
    html: 'Assessment Already Exist',
  },
  documentCreated: {
    codes: 'documentCreated',
    value: 'The Document Created Successfully',
    html: 'The Document Created Successfully',
  },
  adminUserCreated: {
    codes: 'adminUserCreated',
    value: 'Admin User Created Successfully',
    html: 'Admin User Created Successfully',
  },
  noDocument: {
    codes: 'noDocument Found',
    value: 'No Document Found',
    html: 'No Document Found',
  },
  inviteEmailNExist: {
    codes: 'inviteEmailNExist',
    value: `Email doesn't exists in our records`,
    html: `Email doesn't exists in our records`,
  },
  documentDeleted: {
    codes: 'deleteDocument',
    value: 'Document deleted successfully',
    html: 'Document deleted successfully',
  },
  documentExist: {
    codes: 'deleteExist',
    value: 'Document Already Exist With Same Name',
    html: 'Document Already Exist With Same Name',
  },
  documentUpdated: {
    codes: 'documentUpdated',
    value: 'Document Updated Successfully',
    html: 'Document Updated Successfully',
  },
  invitedUserNoEmail: {
    codes: 'invitedUser',
    value: 'Invite Created but Email Failed. Try resending Verification Code or Contact Admin.',
    html: 'Invite Created but Email Failed. Try resending Verification Code or Contact Admin.',
  },
  invalidStepperKey: {
    codes: 'invalidStepperKey',
    value: 'Stepper key is invalid',
    html: 'Stepper key is invalid',
  },
  error: {
    codes: 'error',
    value: 'Error!',
    html: 'Error!',
  },
  internalError: {
    codes: 'internalError',
    value: 'Internal server error',
    html: 'Internal server error',
  },
  notFound: {
    codes: 'notFound',
    value: 'Page not Found',
    html: 'Page not Found',
  },
  reqFields: {
    codes: 'reqFields',
    value: 'Required fields not present',
    html: 'Required fields not present',
  },
  checkCred: {
    codes: 'checkCred',
    value: 'Incorrect Credentials.',
    html: 'Incorrect Credentials.',
  },
  passNM: {
    codes: 'passNM',
    value: 'Password Not Match',
    html: 'Password Not Match',
  },
  passReq: {
    codes: 'passReq',
    value: 'Password is required',
    html: 'Password is required',
  },
  invalidTok: {
    codes: 'invalidTok',
    value: 'Invalid Token',
    html: 'Invalid User',
  },
  planC: {
    codes: 'planC',
    value: 'Plan Created Successfully',
    html: 'Plan Created Successfully',
  },
  recordNM: {
    codes: 'recordNM',
    value: 'Records do not match. Please try again.',
    html: 'Records do not match.\nPlease try again.',
  },
  userC: {
    codes: 'userC',
    value: 'User added successfully',
    html: 'User added successfully',
  },
  userNC: {
    codes: 'userNC',
    value: 'User Not Created',
    html: 'User Not Created',
  },
  userNF: {
    codes: 'userNF',
    value: 'User Not Found',
    html: 'User Not found',
  },
  UserNoCert: {
    codes: 'UserNoCert',
    value: 'User has no certificates',
    html: 'User has no certificates',
  },
  planNC: {
    codes: 'planNC',
    value: 'Plan Not Created',
    html: 'Plan Not Created',
  },
  Inactive: {
    codes: 'Inactive',
    value: 'Cant Send Email. Your Account is Inactive. Kindly contact the Administrator.',
    html: 'Cant Send Email\nYour Account is Inactive. Kindly contact the Administrator.',
  },
  mailSentF: {
    codes: 'mailSentF',
    value: 'Email sent successfully. Please check your Inbox for instructions.',
    html: 'Email sent successfully.\n Please check your Inbox for instructions.',
  },
  passRS: {
    codes: 'passRS',
    value: 'Password Reset Successfully',
    html: 'Password updated Successfully',
  },
  passUS: {
    codes: 'passUS',
    value: 'Password updated Successfully',
    html: 'Password Reset Successfully',
  },
  oldNotEqualToNew: {
    codes: 'oldNotEqualToNew',
    value: 'Old and new password should not be same',
    html: 'Old and new password should not be same',
  },
  pageInval: {
    codes: 'pageInval',
    value: 'PageId is Invalid',
    html: 'PageId is Invalid',
  },
  resetCode: {
    codes: 'resetCode',
    value: 'Reset Code is Invalid',
    html: 'Reset Code is Invalid',
  },
  logout: {
    codes: 'logout',
    value: 'Logout Successfully.',
    html: 'Logout Successfully.',
  },
  tokenAldel: {
    codes: 'tokenAldel',
    value: 'Token already deleted.',
    html: 'Token already deleted.',
  },
  loginSuc: {
    codes: 'loginSuc',
    value: 'Login Successfully.',
    html: 'Login Successfully.',
  },
  firmExist: {
    codes: 'firmExist',
    value: 'Firm Already Exist',
    html: 'Firm Already Exist',
  },
  firmIdExist: {
    codes: 'firmIdExist',
    value: 'Firm Id Already Exist',
    html: 'Firm Id Already Exist',
  },
  noPlan: {
    codes: 'noPlan',
    value: 'No Plan Available',
    html: 'No Plan Available',
  },
  unauthUser: {
    codes: 'unauthUser',
    value: 'Unauthorized User',
    html: 'Unauthorized User',
  },
  noUser: {
    codes: 'noUser',
    value: 'Oops! It seems the email or password you entered is incorrect. Please check and try again.',
    html: 'Oops! It seems the email or password you entered is incorrect. Please check and try again.',
  },
  profUpdateS: {
    codes: 'profUpdateS',
    value: 'User Profile Updated Successfully',
    html: 'User Profile Updated Successfully',
  },
  planExist: {
    codes: 'planExist',
    value: 'Plan name already exists',
    html: 'Plan name already exists',
  },
  verificationAlreadyDone: {
    codes: 'verificationAlreadyDone',
    value: 'Verification already done',
    html: 'Verification already done',
  },
  planComExist: {
    codes: 'planComExist',
    value: 'The selected combination already has an existing plan. Please choose a different combination',
    html: 'The selected combination already\nhas an existing plan\nPlease choose a different combination',
  },
  inCorrectPass: {
    codes: 'inCorrectPass',
    value: 'Login Password entered is incorrect',
    html: 'Login Password entered is\nincorrect',
  },
  noCards: {
    codes: 'noCards',
    value: 'No Cards available for particular user',
    html: 'No Cards available for particular user',
  },
  NotArray: {
    codes: 'NotArray',
    value: 'Data is not an array',
    html: 'Data is not an array',
  },
  noSupType: {
    codes: 'noSupType',
    value: 'No Support Type available',
    html: 'No Support Type available',
  },
  someSupType: {
    codes: 'someSupType',
    value: 'Some Support Types not available',
    html: 'Some Support Types not available',
  },
  noPlanType: {
    codes: 'noPlanType',
    value: 'No Plan Type available',
    html: 'No Plan Type available',
  },
  noOrg: {
    codes: 'noOrg',
    value: 'No Organization exist/active',
    html: 'No Organization exist/active',
  },
  noPlanOrg: {
    codes: 'noPlanOrg',
    value: 'No Active Plan for given organization',
    html: 'No Active Plan for given organization',
  },
  inActPlan: {
    codes: 'inActPlan',
    value: 'No Active Plan/Plan Exist',
    html: 'No Active Plan/Plan Exist',
  },
  checkDates: {
    codes: 'checkDates',
    value: 'Plan Start Date & End Date are not matching mentioned Plans',
    html: 'Plan Start Date & End Date are not matching mentioned Plans',
  },
  orgPlanExist: {
    codes: 'orgPlanExist',
    value: 'Plan Already Exist for Organization',
    html: 'Plan Already Exist for Organization',
  },
  orgPlanNA: {
    codes: 'orgPlanNA',
    value: 'No Active/Expired Plan found for given Organisation',
    html: 'No Active/Expired Plan found for given Organisation',
  },
  noBlockOrg: {
    codes: 'noBlockOrg',
    value: 'No Blocked Plan found for given Organisation',
    html: 'No Blocked Plan found for given Organisation',
  },
  cronSus: {
    codes: 'cronSus',
    value: 'Cron set Successfully at 12.05 AM IST Everyday',
    html: 'Cron set Successfully at 12.05 AM IST Everyday',
  },
  noPlanCafirm: {
    codes: 'noPlanCafirm',
    value: 'No Plan found for given organization',
    html: 'No Plan found for given organization',
  },
  inActUpgPlan: {
    codes: 'inActUpgPlan',
    value: 'No Active Plan/Plan Exist for Upgrade',
    html: 'No Active Plan/Plan Exist for Upgrade',
  },
  samePlan: {
    codes: 'samePlan',
    value: 'Current Plan & Upgrade Plan are Same',
    html: 'Current Plan & Upgrade Plan are Same',
  },
  payModeNF: {
    codes: 'payModeNF',
    value: 'Payment mode not found',
    html: 'Payment mode not found',
  },
  noPlanAvl: {
    codes: 'noPlanAvl',
    value: 'No Plan Exist for given organization',
    html: 'No Plan Exist for given organization',
  },
  noPlanEx: {
    codes: 'noPlanEx',
    value: 'Blocked/No Plan Exist for given organization. Also,Please check firm end-date.',
    html: 'Blocked/No Plan Exist for given organization. Also,Please check firm end-date.',
  },
  sameDate: {
    codes: 'sameDate',
    value: 'Current End-Date & New End-Date are Same',
    html: 'Current End-Date & New End-Date are Same',
  },
  moduleNExist: {
    codes: 'moduleNExist',
    value: 'No Such Module Exist',
    html: 'No Such Module Exist',
  },
  roleNExist: {
    codes: 'roleNExist',
    value: 'No Such Role Exist',
    html: 'No Such Role Exist',
  },
  groupNExist: {
    codes: 'groupNExist',
    value: 'No Such Group Exist',
    html: 'No Such Group Exist',
  },
  featureCombExist: {
    codes: 'featureCombExist',
    value: 'Same features already exist in diffent roles',
    html: 'Same features already exist in different roles',
  },
  roleCreated: {
    codes: 'roleCreated',
    value: 'The Role Created Successfully',
    html: 'The Role Created Successfully',
  },
  keyExists: {
    codes: 'keyExists',
    value: 'One or more keys already exist',
    html: 'One or more keys already exist',
  },
  roleNameExists: {
    codes: 'roleNameExists',
    value: 'Role name already exists',
    html: 'Role name already exists',
  },
  roleFetch: {
    codes: 'roleFetch',
    value: 'The Role fetched Successfully',
    html: 'The Role fetched Successfully',
  },
  lengthMisMatch: {
    codes: 'lengthMisMatch',
    value: 'Lengths of roleFeaturesQuery length is zero',
    html: 'Lengths of roleFeaturesQuery length is zero',
  },
  featureExist: {
    codes: 'featureExist',
    value: 'Features Already Exist',
    html: 'Features Already Exist',
  },
  featuresAdd: {
    codes: 'featuresAdd',
    value: 'Features Added Successfully',
    html: 'Features Added Successfully',
  },
  moduleExist: {
    codes: 'moduleExist',
    value: 'Modules Already Exist',
    html: 'Modules Already Exist',
  },
  groupExist: {
    codes: 'groupExist',
    value: 'Group Already Exist',
    html: 'Group Already Exist',
  },
  modulesAdd: {
    codes: 'modulesAdd',
    value: 'Modules Added Successfully',
    html: 'Modules Added Successfully',
  },
  groupAdd: {
    codes: 'groupAdd',
    value: 'Group Added Successfully',
    html: 'Group Added Successfully',
  },
  featureNExist: {
    codes: 'featureNExist',
    value: 'Some Features not found',
    html: 'Some Features not found',
  },
  featureMapMod: {
    codes: 'featureMapMod',
    value: 'Features Successfully Mapped',
    html: 'Features Successfully Mapped',
  },
  featureNMapMod: {
    codes: 'featureNMapMod',
    value: 'Features Not Mapped',
    html: 'Features Not Mapped',
  },
  noModules: {
    codes: 'noModules',
    value: 'No Modules Found',
    html: 'No Modules Found',
  },
  noFeatures: {
    codes: 'noFeatures',
    value: 'No Active/Exist Features Found',
    html: 'No Active/Exist Features Found',
  },
  noGroup: {
    codes: 'noGroup',
    value: 'No Group Found',
    html: 'No Group Found',
  },
  featureNUMod: {
    codes: 'featureNUMod',
    value: 'No Features not under Respective Module',
    html: 'No Features not under Respective Module',
  },
  accessDenied: {
    codes: 'accessDenied',
    value: 'Permission Denied to Access',
    html: 'Permission Denied to Access',
  },
  noActiveUser: {
    codes: 'noActiveUser',
    value: 'No Active users found',
    html: 'No Active users found',
  },
  noUsers: {
    codes: 'noUsers',
    value: 'No users found',
    html: 'No users found',
  },
  roleUpdate: {
    codes: 'roleUpdate',
    value: 'Role Updated Successfully.',
    html: 'Role Updated Successfully.',
  },
  emailNExist: {
    codes: 'emailNExist',
    value: 'No Such Email Exist',
    html: 'No Such Email Exist',
  },
  emailExist: {
    codes: 'emailExist',
    value: 'Email Already Exist',
    html: 'Email Already Exist',
  },
  numberExist: {
    codes: 'numberExist',
    value: 'Number Already Exist',
    html: 'Number Already Exist',
  },
  updateUsr: {
    codes: 'updateUsr',
    value: 'User Profile Updated Successfully',
    html: 'User Profile Updated Successfully',
  },
  deleteUsr: {
    codes: 'deleteUsr',
    value: 'User deleted successfully',
    html: 'User deleted successfully',
  },
  unAuth: {
    codes: 'unAuth',
    value: 'Unauthorized User',
    html: 'Unauthorized User',
  },
  inValid: {
    codes: 'inValid',
    value: 'Invite is InValid, Please contact your Admin',
    html: 'Invite is InValid, Please contact your Admin',
  },
  updateUsrStatus: {
    codes: 'updateUsrStatus',
    value: 'Userstatus Updated Successfully',
    html: 'Userstatus Updated Successfully',
  },
  resendMail: {
    codes: 'resendMail',
    value: 'Resend Mail Sent Successfully',
    html: 'Resend Mail Sent Successfully',
  },
  inActiveUsr: {
    codes: 'inActiveUsr',
    value: 'Your account is currently inactive.Please contact administrator.',
    html: 'Your account is currently inactive.Please contact administrator.',
  },
  roleDelete: {
    codes: 'roleDelete',
    value: 'Roles Delete Successfully',
    html: 'Roles Delete Successfully',
  },
  adminChange: {
    codes: 'adminChange',
    value: 'Admin Changed Successfully',
    html: 'Admin Changed Successfully',
  },
  inCorrectAdmPass: {
    codes: 'inCorrectAdmPass',
    value: 'Incorrect Admin Password.',
    html: 'Incorrect Admin Password.',
  },
  userNameExist: {
    codes: 'userNameExist',
    value: 'Username Already Taken.',
    html: 'Username Already Taken.',
  },
  userNameIsAvailable: {
    codes: 'userNameIsAvailable',
    value: 'Username is Available.',
    html: 'Username is Available.',
  },
  inviteUserInvalid: {
    codes: 'inviteUserInvalid',
    value: 'Verification Code is Invalid',
    html: 'Verification Code is Invalid',
  },
  inviteUserExpired: {
    codes: 'inviteUserExpired',
    value: 'Verification Code got expired',
    html: 'Verification Code got expired',
  },
  inviteUserent: {
    codes: 'inviteUserent',
    value: 'Verification code sent to your email ID!',
    html: 'Verification code sent to your email ID!',
  },
  verifiedCode: {
    codes: 'verifiedCode',
    value: 'verified the code successfully',
    html: 'verified the code successfully',
  },
  errorInCode: {
    codes: 'errorInCode',
    value: 'Error in generating verification code!',
    html: 'Error in generating verification code!',
  },
  errorInCreating: {
    codes: 'errorInCreating',
    value: 'Error in creating verification code!',
    html: 'Error in creating verification code!',
  },
  invitePaid: {
    codes: 'invitePaid',
    value: 'Allows Only Paid Plan.',
    html: 'Allows Only Paid Plan.',
  },
  inviteEmailExist: {
    codes: 'inviteEmailExist',
    value: 'Please Check Your Mail Box. Invitation Code is still Active.',
    html: 'Please Check Your Mail Box. Invitation Code is still Active.',
  },
  inviteUserPaid: {
    codes: 'inviteUserPaid',
    value: 'Please Check Your Mail Box. Verification Code has been Sent.',
    html: 'Please Check Your Mail Box. Verification Code has been Sent.',
  },
  invitedUser: {
    codes: 'invitedUser',
    value: 'Please Check Your Mail Box. Verification Code has been Sent.',
    html: 'Please Check Your Mail Box. Verification Code has been Sent.',
  },
  userEmailExist: {
    codes: 'userEmailExist',
    value: 'User Already Exist / Inactive.',
    html: 'User Already Exist / Inactive.',
  },
  noWork: {
    codes: 'noWork',
    value: 'No Such Work Type Exist / Available',
    html: 'No Such Work Type Exist / Available',
  },
  noRate: {
    codes: 'noRate',
    value: 'No Such Rate & Fees Exist / Available',
    html: 'No Such Rate & Fees Exist / Available',
  },
  topicsCreate: {
    codes: 'topicsCreate',
    value: 'Topic Created Successfully',
    html: 'Topic Created Successfully',
  },
  topicsGet: {
    codes: 'topicsGet',
    value: 'Topic Get Successfully',
    html: 'Topic Get Successfully',
  },
  topicsUpdate: {
    codes: 'topicsUpdate',
    value: 'Topic Updated Successfully',
    html: 'Topic Updated Successfully',
  },
  assessmentFetched: {
    codes: 'assessmentFetched',
    value: 'Assessment Fetched Successfully',
    html: 'Assessment Fetched Successfully',
  },
  assessmentUpdated: {
    codes: 'assessmentUpdated',
    value: 'Assessment Updated Successfully',
    html: 'Assessment Updated Successfully',
  },
  noCourseExist: {
    codes: 'noCourseExist',
    value: 'Course not Found',
    html: 'Course not Found',
  },
  courseGet: {
    codes: 'courseGet',
    value: 'Courses Fetched successfully',
    html: 'Courses Fetched successfully',
  },
  GetOneCourse: {
    codes: 'GetOneCourse',
    value: 'Course Fetched successfully',
    html: 'Course Fetched successfully',
  },
  courseNP: {
    codes: 'courseNP',
    value: 'Course not purchased',
    html: 'Course not purchased',
  },
  courseNF: {
    codes: 'courseNP',
    value: 'Course not found',
    html: 'Course not found',
  },
  courseNotActive: {
    codes: 'courseNotActive',
    value: 'Course is not Active',
    html: 'Course is not Active',
  },
  NoCourseContent: {
    codes: 'no CourseContent',
    value: 'No CourseContent Found',
    html: 'No CourseContent Found',
  },
  noAssessment: {
    codes: 'noAssessment',
    value: 'Assessment Not Found',
    html: 'Assessment Not Found',
  },
  assessmentDelete: {
    codes: 'assessmentDelete',
    value: 'Assessment Deleted Successfully',
    html: 'Assessment Deleted Successfully',
  },
  assessmentStatusUpdate: {
    codes: 'assessmentStatusUpdate',
    value: 'Assessment Status Updated Successfully',
    html: 'Assessment Status Updated Successfully',
  },
  assessmentTaken: {
    codes: 'assessmentTaken',
    value: 'User Already Taken Assessment',
    html: 'User Already Taken Assessment',
  },
  noAssessmentAttempt: {
    codes: 'noAssessmentAttempt',
    value: ' User has not completed the assessment',
    html: ' User has not completed the assessment',
  },
  topicsDelete: {
    codes: 'topicsDelete',
    value: 'Topic Deleted Successfully',
    html: 'Topic Deleted Successfully',
  },
  subtopicsCreate: {
    codes: 'subtopicsCreate',
    value: 'subtopic Created Successfully',
    html: 'subtopic Created Successfully',
  },
  subtopicsGet: {
    codes: 'subtopicsGet',
    value: 'subtopic Get Successfully',
    html: 'subtopic Get Successfully',
  },
  subtopicsUpdate: {
    codes: 'subtopicsUpdate',
    value: 'subtopic Updated Successfully',
    html: 'subtopic Updated Successfully',
  },
  subtopicsDelete: {
    codes: 'subtopicsDelete',
    value: 'subtopic Deleted Successfully',
    html: 'subtopic Deleted Successfully',
  },
  independentSubtopics: {
    codes: 'subtopicsNotAssociated',
    value: 'Subtopics are not associated with Topics',
    html: 'Subtopics are not associated with Topics',
  },
  categoryCreate: {
    codes: 'categoryCreate',
    value: 'category Created Successfully',
    html: 'category Created Successfully',
  },
  categoryGet: {
    codes: 'categoryGet',
    value: 'category Get Successfully',
    html: 'category Get Successfully',
  },
  categoryUpdate: {
    codes: 'categoryUpdate',
    value: 'category Updated Successfully',
    html: 'category Updated Successfully',
  },
  categoryDelete: {
    codes: 'categoryDelete',
    value: 'category Deleted Successfully',
    html: 'category Deleted Successfully',
  },
  tagsCreate: {
    codes: 'tagsCreate',
    value: 'tag Created Successfully',
    html: 'tag Created Successfully',
  },
  tagsGet: {
    codes: 'tagsGet',
    value: 'tag Get Successfully',
    html: 'tag Get Successfully',
  },
  tagsUpdate: {
    codes: 'tagsUpdate',
    value: 'tag Updated Successfully',
    html: 'tag Updated Successfully',
  },
  tagsDelete: {
    codes: 'tagsDelete',
    value: 'tag Deleted Successfully',
    html: 'tag Deleted Successfully',
  },
  categoryExist: {
    codes: 'alreadyExist',
    value: 'Category  Already Exist With Same Name',
    html: 'Category  Already Exist With Same Name',
  },
  topicsExist: {
    codes: 'alreadyExist',
    value: 'Topic already exists',
    html: 'Topic already exists',
  },
  subtopicsExist: {
    codes: 'alreadyExist',
    value: 'subtopic already exists',
    html: 'subtopic already exists',
  },
  tagsExist: {
    codes: 'alreadyExist',
    value: 'Duplicate tag name',
    html: 'Duplicate tag name',
  },
  categoryNotFound: {
    codes: 'notFound',
    value: 'category not Found',
    html: 'category not Found',
  },
  categoryLinkWithCourse: {
    codes: 'categoryLinkedWithCourse',
    value: 'Category cannot be deleted due to its association with a course',
    html: 'Category cannot be deleted due to its association with a course',
  },
  topicsNotFound: {
    codes: 'notFound',
    value: 'topic not Found',
    html: 'topic not Found',
  },
  subtopicsNotFound: {
    codes: 'notFound',
    value: 'subtopic not Found',
    html: 'subtopic not Found',
  },
  tagsNotFound: {
    codes: 'notFound',
    value: 'tag not Found',
    html: 'tag not Found',
  },
  noFile: {
    codes: 'noFile',
    value: 'No file uploaded',
    html: 'No file uploaded',
  },
  userNameNotFound: {
    codes: 'userNameNotFound',
    value: 'User Name not found',
    html: 'User Name not found',
  },
  ppNotFound: {
    codes: 'ppNotFound',
    value: 'Profile Picture not found',
    html: 'Profile Picture not found',
  },
  hiNotFound: {
    codes: 'hiNotFound',
    value: 'Header Image not found',
    html: 'Header Image not found',
  },
  noInvUser: {
    codes: 'noInvUser',
    value: 'Not - Exist / Invite User',
    html: 'Not - Exist / Invite User',
  },
  noCollegeFound: {
    codes: 'noCollegeFound',
    value: 'College Not Found',
    html: 'College Not Found',
  },
  noCareer: {
    codes: 'noCareer',
    value: 'Career Not Found',
    html: 'Career Not Found',
  },
  noProfFound: {
    codes: 'noProfFound',
    value: 'Profession Not Found',
    html: 'Profession Not Found',
  },
  noDeptFound: {
    codes: 'noDeptFound',
    value: 'Department Not Found',
    html: 'Department Not Found',
  },
  noDegreeFound: {
    codes: 'noDegreeFound',
    value: 'Degree Not Found',
    html: 'Degree Not Found',
  },
  noCategory: {
    codes: 'noCategory',
    value: 'Category Not Found',
    html: 'Category Not Found',
  },
  noTags: {
    codes: 'noTags',
    value: 'Tags Not Found',
    html: 'Tags Not Found',
  },
  noDifficulty: {
    codes: 'noDifficulty',
    value: 'Difficulty Not Found',
    html: 'Difficulty Not Found',
  },
  noMarks: {
    codes: 'noMarks',
    value: 'Marks Not Found',
    html: 'Marks Not Found',
  },
  markIV: {
    codes: 'markTypeInvalid',
    value: 'Invalid Input for Mark Type Global',
    html: 'Invalid Input for Mark Type Global',
  },
  noReattempt: {
    codes: 'noReattempt',
    value: 'Reattempt Not Found',
    html: 'Reattempt Not Found',
  },
  noType: {
    codes: 'noType',
    value: 'Type Not Found',
    html: 'Type Not Found',
  },
  noStatus: {
    codes: 'noStatus',
    value: 'Status Not Found',
    html: 'Status Not Found',
  },
  invalidParams: {
    codes: 'invalidParams',
    value: 'Parameters are invalid',
    html: 'Parameters are invalid',
  },
  optionsExists: {
    codes: 'optionsExists',
    value: 'Options already exists',
    html: 'Options already exists',
  },
  noROptions: {
    codes: 'rightOptionsNotExists',
    value: 'Provide Atleast One Right Option',
    html: 'Provide Atleast One Right Option',
  },
  questionExists: {
    codes: 'questionExists',
    value: 'Question already exists',
    html: 'Question already exists',
  },
  questionUpdated: {
    codes: 'questionUpdated',
    value: 'Question Updated Successfully',
    html: 'Question Updated Successfully',
  },
  courseExist: {
    codes: 'courseExist',
    value: 'Course Name already exists',
    html: 'Course Name already exists',
  },
  sectionExist: {
    codes: 'sectionExist',
    value: 'Course Section already exists',
    html: 'Course Section already exists',
  },
  contentExist: {
    codes: 'contentExist',
    value: 'Course Content already exists',
    html: 'Course Content already exists',
  },
  questionsNotExists: {
    codes: 'questionsNotExists',
    value: 'Questions Does not exists',
    html: 'Questions Does not exists',
  },
  questionsLinkWithAssessment: {
    codes: 'questionsLinkWithAssessment',
    value: `Cannot delete question as it's linked to an assessment`,
    html: `Cannot delete question as it's linked to an assessment`,
  },
  questionDeleted: {
    codes: 'questionDeleted',
    value: 'Question Deleted Successfully',
    html: 'Question Deleted Successfully',
  },
  questionLengthMismatch: {
    codes: 'questionLengthMismatch',
    value: 'Number of questions provided for the assessment does not match ',
    html: 'Number of questions provided for the assessment does not match ',
  },
  questionsPossibilityNotExists: {
    codes: 'questionsPossibilityNotExists',
    value: 'QuestionsPossibilities Does not exists',
    html: 'QuestionsPossibilities Does not exists',
  },
  assessmentCreated: {
    codes: 'assessmentCreated',
    value: 'Assessment Created Successfully',
    html: 'Assessment Created Successfully',
  },
  itemCreated: {
    codes: 'itemCreated',
    value: 'Course items Created Successfully',
    html: 'Course items Created Successfully',
  },
  contentCreated: {
    codes: 'contentCreated',
    value: 'Course Content Created Successfully',
    html: 'Course Content Created Successfully',
  },
  courseCreated: {
    codes: 'courseCreated',
    value: 'Course Created Successfully',
    html: 'Course Created Successfully',
  },
  sectionCreated: {
    codes: 'sectionCreated',
    value: 'Section Created Successfully',
    html: 'Section Created Successfully',
  },
  questionsCreated: {
    codes: 'questionsCreated',
    value: 'Question Created Successfully',
    html: 'Question Created Successfully',
  },
  optionsCreated: {
    codes: 'optionsCreated',
    value: 'Options Created Successfully',
    html: 'Options Created Successfully',
  },
  NoCourseSection: {
    codes: 'no CourseSection Found',
    value: 'No CourseSection Found',
    html: 'No CourseSection Found',
  },
  courseSectionNotCreated: {
    codes: ' courseSection Not Created',
    value: 'CourseSection Not Created',
    html: 'CourseSection Not Created',
  },
  courseSectionCreated: {
    codes: 'courseSection  Created',
    value: 'CourseSection Created',
    html: 'CourseSection Created',
  },
  courseSectionExist: {
    codes: 'courseSectionExist',
    value: 'CourseSection Name Already Exist ',
    html: 'CourseSection Name Already Exist',
  },
  rightOptionsError: {
    codes: 'invalidRightOpton',
    value: 'The right option should be exactly one, not more',
    html: 'The right option should be exactly one, not more',
  },
  totalROError: {
    codes: 'invalidRightOpton',
    value: 'Total right options provided does not match correct options specified',
    html: 'Total right options provided does not match correct options specified',
  },
  OptionsCountNM: {
    codes: 'optionCountMismatch',
    value: `Option count doesn't match provided total `,
    html: `Option count doesn't match provided total `,
  },
  OptionsAtleast: {
    codes: 'optionCountMismatch',
    value: `Option count doesn't match provided total `,
    html: `Option count doesn't match provided total `,
  },
  noOptions: {
    codes: 'noOptions',
    value: 'Options Not exists',
    html: 'Options Not exists',
  },

  // `Provide Atleast 3 Options`
  invalidRO: {
    codes: 'invalidRO',
    value: `Provide Atleast 3 Options`,
    html: `Provide Atleast 3 Options`,
  },
  durationExceed: {
    codes: 'durationExceed',
    value: 'Duration Exceeded the Assessment Duration',
    html: 'Duration Exceeded the Assessment Duration',
  },
  durationWrong: {
    codes: 'wrongDurationInput',
    value: 'Wrong Duration Input',
    html: 'Wrong Duration Input',
  },
  durationIV: {
    codes: 'invalidDuration',
    value: 'Duration should range from 10 minutes to 12 hours',
    html: 'Duration should range from 10 minutes to 12 hours',
  },
  noLanguage: {
    codes: 'noLanguage',
    value: 'Language Not Found',
    html: 'Language Not Found',
  },
  noCourseIncludes: {
    codes: 'noCourseIncludes',
    value: 'No Course Includes Found',
    html: 'No Course Includes Found',
  },
  noOfferDate: {
    codes: 'provideOfferDate',
    value: 'Please provide both start and end dates for the offer',
    html: 'Please provide both start and end dates for the offer',
  },
  deleteSuccess: {
    codes: 'delete',
    value: 'Deleted Successfully',
    html: 'Deleted Successfully',
  },
  noData: {
    codes: 'noData',
    value: 'Data Not Found',
    html: 'Data Not Found',
  },
};

module.exports = rescodes;
