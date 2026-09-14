const fs = require('fs');

const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // --- UTILITY FUNCTIONS ---
    function isSignedIn() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function getUserSchoolId() {
      return getUserData().get('schoolId', null);
    }
    
    function getUserRole() {
      return getUserData().get('role', '');
    }
    
    function isSuperAdmin() {
      return isSignedIn() && getUserRole() == 'SUPER_ADMIN';
    }
    
    function isAdmin() {
      return isSignedIn() && getUserRole() == 'ADMIN';
    }
    
    function isTeacher() {
      return isSignedIn() && getUserRole() == 'TEACHER';
    }
    
    function isParent() {
      return isSignedIn() && getUserRole() == 'PARENT';
    }
    
    function belongsToSchool(schoolId) {
      return isSignedIn() && schoolId != null && getUserSchoolId() == schoolId;
    }

    function isUnchanged(field) {
      return !request.resource.data.diff(resource.data).affectedKeys().hasAny([field]);
    }
    
    function isOwnerTeacher(data) {
      return isTeacher() && data.get('teacherId', null) == request.auth.uid;
    }
    
    function isNoticeCreator(data) {
      return isTeacher() && data.get('creatorId', null) == request.auth.uid;
    }

    // --- USERS ---
    match /users/{userId} {
      allow read: if isSignedIn() && request.auth.uid == userId;
      allow read: if isSuperAdmin();
      allow read: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null));
      
      allow update, delete: if isSuperAdmin();
      allow update, delete: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null)) && request.resource.data.get('role', '') != 'SUPER_ADMIN';
      
      allow create: if isSignedIn() && request.auth.uid == userId && request.resource.data.get('role', '') != 'SUPER_ADMIN';
      allow create: if isSuperAdmin();
      allow create: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null)) && request.resource.data.get('role', '') != 'SUPER_ADMIN';
    }

    // --- SCHOOLS ---
    match /schools/{schoolId} {
      allow read: if isSuperAdmin();
      allow read: if belongsToSchool(schoolId);
      
      allow create, delete: if isSuperAdmin();
      allow update: if isSuperAdmin();
      allow update: if isAdmin() && belongsToSchool(schoolId);
    }

    // --- ENQUIRIES ---
    match /enquiries/{enquiryId} {
      allow create: if true;
      allow read, update, delete: if isSuperAdmin();
    }

    // --- ADMISSIONS ---
    match /admissions/{admissionId} {
      allow read: if isSuperAdmin();
      allow read: if belongsToSchool(resource.data.get('schoolId', null));
      allow write: if isSuperAdmin();
      allow write: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
    }

    // --- STUDENTS ---
    match /students/{studentId} {
      allow read: if isSuperAdmin();
      allow read: if (isAdmin() || isTeacher()) && belongsToSchool(resource.data.get('schoolId', null));
      allow read: if isParent() && resource.data.get('parentId', null) == request.auth.uid;
      allow write: if isSuperAdmin();
      allow write: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
    }

    // --- TEACHERS ---
    match /teachers/{teacherId} {
      allow read: if isSuperAdmin();
      allow read: if belongsToSchool(resource.data.get('schoolId', null));
      allow write: if isSuperAdmin();
      allow write: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
    }

    // --- ATTENDANCE ---
    match /attendance/{attendanceId} {
      allow read: if (isAdmin() || isTeacher()) && belongsToSchool(resource.data.get('schoolId', null));
      allow read: if isParent() && belongsToSchool(resource.data.get('schoolId', null)); // Simplified for parent since they will query based on their child's records
      allow write: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
      allow create: if isTeacher() && belongsToSchool(request.resource.data.get('schoolId', null)) && isOwnerTeacher(request.resource.data);
      allow update: if isTeacher() && belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data) && isOwnerTeacher(request.resource.data) && isUnchanged('schoolId') && isUnchanged('teacherId');
    }

    // --- FEES & FEE STRUCTURES ---
    match /feeStructures/{structureId} {
      allow read: if belongsToSchool(resource.data.get('schoolId', null));
      allow write: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
    }

    match /fees/{feeId} {
      allow read: if belongsToSchool(resource.data.get('schoolId', null)) && (isAdmin() || isParent());
      allow write: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
    }

    match /feeTransactions/{transactionId} {
      allow read: if belongsToSchool(resource.data.get('schoolId', null)) && (isAdmin() || isParent());
      allow write: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
    }

    match /feeRefunds/{refundId} {
      allow read: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null));
      allow write: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
    }

    // --- NOTICES ---
    match /notices/{noticeId} {
      allow read: if isSuperAdmin() || belongsToSchool(resource.data.get('schoolId', null));
      allow create: if isSuperAdmin() || (isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null)));
      allow create: if belongsToSchool(request.resource.data.get('schoolId', null)) && isNoticeCreator(request.resource.data);
      allow update: if isSuperAdmin();
      allow update: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null)) && isUnchanged('schoolId');
      allow update: if belongsToSchool(resource.data.get('schoolId', null)) && isNoticeCreator(resource.data) && isNoticeCreator(request.resource.data) && isUnchanged('schoolId') && isUnchanged('creatorId') && isUnchanged('creatorRole');
      allow delete: if isSuperAdmin();
      allow delete: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null));
      allow delete: if belongsToSchool(resource.data.get('schoolId', null)) && isNoticeCreator(resource.data);
    }

    // --- NOTIFICATIONS ---
    match /notifications/{notificationId} {
      allow read: if belongsToSchool(resource.data.get('schoolId', null)) && resource.data.get('userId', null) == request.auth.uid;
      allow write: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
      allow update: if belongsToSchool(resource.data.get('schoolId', null)) && resource.data.get('userId', null) == request.auth.uid && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isRead']);
    }

    match /notificationPreferences/{preferenceId} {
      allow read: if belongsToSchool(resource.data.get('schoolId', null)) && resource.data.get('userId', null) == request.auth.uid;
      allow write: if belongsToSchool(request.resource.data.get('schoolId', null)) && request.resource.data.get('userId', null) == request.auth.uid;
    }

    // --- HOMEWORK ---
    match /homework/{homeworkId} {
      allow read: if (isAdmin() || isTeacher() || isParent()) && belongsToSchool(resource.data.get('schoolId', null));
      allow create: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
      allow create: if isTeacher() && belongsToSchool(request.resource.data.get('schoolId', null)) && isOwnerTeacher(request.resource.data);
      allow update: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null)) && isUnchanged('schoolId');
      allow update: if belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data) && isOwnerTeacher(request.resource.data) && isUnchanged('schoolId') && isUnchanged('teacherId');
      allow delete: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null));
      allow delete: if belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data);
    }

    // --- EXAMS & RESULTS ---
    match /exams/{examId} {
      allow read: if belongsToSchool(resource.data.get('schoolId', null));
      allow write: if (isAdmin() || isTeacher()) && belongsToSchool(request.resource.data.get('schoolId', null));
    }

    match /results/{resultId} {
      allow read: if (isAdmin() || isTeacher() || isParent()) && belongsToSchool(resource.data.get('schoolId', null));
      allow create: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
      allow create: if isTeacher() && belongsToSchool(request.resource.data.get('schoolId', null)) && isOwnerTeacher(request.resource.data);
      allow update: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null)) && isUnchanged('schoolId');
      allow update: if belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data) && isOwnerTeacher(request.resource.data) && isUnchanged('schoolId') && isUnchanged('teacherId');
      allow delete: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null));
      allow delete: if belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data);
    }

    // --- TIMETABLE ---
    match /timetable/{id} {
      allow read: if isSuperAdmin();
      allow read: if belongsToSchool(resource.data.get('schoolId', null));
      allow create: if isSuperAdmin();
      allow create: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
      allow create: if belongsToSchool(request.resource.data.get('schoolId', null)) && isOwnerTeacher(request.resource.data);
      allow update: if isSuperAdmin();
      allow update: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null)) && isUnchanged('schoolId');
      allow update: if belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data) && isOwnerTeacher(request.resource.data) && isUnchanged('schoolId') && isUnchanged('teacherId');
      allow delete: if isSuperAdmin();
      allow delete: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null));
      allow delete: if belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data);
    }
    
    // --- CLASS PROGRESS ---
    match /classProgress/{id} {
      allow read: if isSuperAdmin();
      allow read: if belongsToSchool(resource.data.get('schoolId', null));
      allow create: if isSuperAdmin();
      allow create: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
      allow create: if belongsToSchool(request.resource.data.get('schoolId', null)) && isOwnerTeacher(request.resource.data);
      allow update: if isSuperAdmin();
      allow update: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null)) && isUnchanged('schoolId');
      allow update: if belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data) && isOwnerTeacher(request.resource.data) && isUnchanged('schoolId') && isUnchanged('teacherId');
      allow delete: if isSuperAdmin();
      allow delete: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null));
      allow delete: if belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data);
    }

    // --- CLASSES, SECTIONS, SUBJECTS ---
    match /classes/{classId} {
      allow read: if belongsToSchool(resource.data.get('schoolId', null));
      allow write: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
    }

    match /sections/{sectionId} {
      allow read: if belongsToSchool(resource.data.get('schoolId', null));
      allow write: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
    }

    match /subjects/{subjectId} {
      allow read: if belongsToSchool(resource.data.get('schoolId', null));
      allow write: if isAdmin() && belongsToSchool(request.resource.data.get('schoolId', null));
    }

    // --- COMPLAINTS ---
    match /complaints/{complaintId} {
      allow read: if belongsToSchool(resource.data.get('schoolId', null));
      allow write: if belongsToSchool(request.resource.data.get('schoolId', null));
    }

    // --- SUPPORT ---
    match /support/{supportId} {
      allow read: if isSuperAdmin() || (isSignedIn() && belongsToSchool(resource.data.get('schoolId', null)));
      allow write: if isSuperAdmin() || (isSignedIn() && belongsToSchool(request.resource.data.get('schoolId', null)));
    }
  }
}
`;

fs.writeFileSync('firestore.rules', rules);
