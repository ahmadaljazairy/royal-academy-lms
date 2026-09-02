# Project Overview & Conventions

# Software Requirements Specification

**Project Name :** Royal Academy

**Current Milestone :** Version 1.0 (MVP)

## Project Scope & Release Strategy

The LMS platform manages digital course delivery, interactive assessments, grading, and role-based administration for students, instructors, and system administrators.

| Milestone        | Focus & Core Deliverables                                                                                                 | Status  |
|:---------------- |:------------------------------------------------------------------------------------------------------------------------- |:------- |
| **Version 1.0**  | Core learning loop: auth, course catalog, video player, quizzes, file submissions, basic grading, and admin approval.     | Active  |
| **Version 2.0**  | Rich features: social login, coupons, calendar views, essay questions, bilingual AR/EN toggle, and course ratings.        | Planned |
| **Version 3.0+** | Advanced capabilities: 2FA, anti-cheat detection, student study streaks, bulk imports, AI features, and direct messaging. | Backlog |

## User Roles & Permissions

| Role              | Access Tier          | Core Responsibilities & Workflow Scope                                                                                    |
|:----------------- |:-------------------- |:------------------------------------------------------------------------------------------------------------------------- |
| **Student**       | Tier 3  (External)   | Browse courses, enroll, stream video lectures, submit assignments, take timed exams, and track grades/certificates.       |
| **Instructor**    | Tier 2 (Authorized)  | Build curriculum sections, upload lectures/files, create exams/assignments, evaluate submissions, and view class metrics. |
| **Administrator** | Tier 1 (Super-Admin) | Manage users, approve submitted courses, oversee revenue/coupons, configure categories, and audit system logs.            |

## 

## 

## Priority & Release Reference Framework

All functional requirements follow this prioritization schema to define implementation order and release criteria:

| Priority Tag             | Implementation Target      | Definition & Decision Rule                                                                 |
|:------------------------ |:-------------------------- |:------------------------------------------------------------------------------------------ |
| **Must Have (Must)**     | V1.0  (MVP Baseline)       | Critical core functionality. A missing item blocks platform release.                       |
| **Should Have (Should)** | V2.0  (High Priority)      | High-value capability. Essential for standard UX but not a blocker for initial MVP launch. |
| **Nice to Have (Nice)**  | V3.0  (Future Enhancement) | Quality-of-life, retention, or gamification feature. Implemented after core stability.     |



# Student Software Requirements

**Module Prefix :** REQ-STU  
**User Role :** Student (Tier 3\)

## **Authentication, Profile & Security**

| Req ID              | Capability & Description                                                                                                    | Priority   | Target Release    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-STU-AUTH-01** | **Email Registration & Login:** Register and log in using an email address and salted password.                             | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-AUTH-02** | **Email Verification:** Complete account activation via a one-time verification link sent to email.                         | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-AUTH-03** | **Password Reset Flow:** Request a secure, time-expiring password reset token via email.                                    | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-AUTH-04** | **Profile & Security Settings:** Update display name, profile photo, and change active password.                            | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-AUTH-05** | **Social Authentication:** Sign in or register using Google OAuth.                                                          | **Should** | Version 2.0       |
| **REQ-STU-AUTH-06** | **Language Toggle:** Switch interface between Arabic (RTL) and English (LTR) with persisted user preference.                | **Should** | Version 2.0       |
| **REQ-STU-AUTH-07** | **Notification Preferences:** Configure in-app and email alert preferences for assignments and announcements.               | **Should** | Version 2.0       |
| **REQ-STU-AUTH-08** | **Two-Factor Authentication (2FA):** Enable TOTP-based multi-factor authentication for enhanced account security.           | **Nice**   | Version 3.0       |
| **REQ-STU-AUTH-09** | **Account Data Export & Erasure:** Request a copy of personal learning records or initiate GDPR-compliant account deletion. | **Nice**   | Version 3.0       |

## 

## **Student Dashboard**

| Req ID              | Capability & Description                                                                                                  | Priority   | Target Release    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-STU-DASH-01** | **Enrolled Courses Grid:** View active courses with visual progress bars (percentage completed).                          | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-DASH-02** | **Upcoming Tasks Widget:** Chronological list of pending assignment due dates and upcoming scheduled sessions.            | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-DASH-03** | **Announcements Feed:** View broadcast notices and updates published by instructors for enrolled courses.                 | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-DASH-04** | **Resume Learning Quick Link:** Direct 1-click CTA to jump to the exact lecture and video timestamp last watched.         | **Should** | Version 2.0       |
| **REQ-STU-DASH-05** | **Learning Metrics Summary:** Display high-level stats: total courses completed, certificates earned, and hours studied.  | **Should** | Version 2.0       |
| **REQ-STU-DASH-06** | **Personalized Greeting Banner:** Dynamic dashboard header displaying student name and contextual progress encouragement. | **Should** | Version 2.0       |
| **REQ-STU-DASH-07** | **Recommended Courses:** System-suggested courses based on enrolled topics and browsing categories.                       | **Nice**   | Version 3.0       |

## **Course Catalog, Discovery & Enrollment**

| Req ID              | Capability & Description                                                                                                              | Priority   | Target Release    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-STU-CATL-01** | **Search & Category Filtering:** Search catalog by keyword, topic category, difficulty level, language, and price.                    | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-CATL-02** | **Course Landing Page:** View course title, description, curriculum outline, instructor bio, and requirements.                        | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-CATL-03** | **Free Public Preview:** Stream designated sample preview lectures without requiring prior course purchase.                           | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-CATL-04** | **Free Course 1-Click Enrollment:** Instantly enroll in free courses with immediate access to curriculum content.                     | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-CATL-05** | **Paid Enrollment via PayPal:** Complete course purchase via PayPal standard checkout with automated enrollment upon payment success. | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-CATL-06** | **Credit Card / Stripe Checkout:** Process payments directly via major credit/debit cards.                                            | **Should** | Version 2.0       |
| **REQ-STU-CATL-07** | **Coupon & Promotion Redemption:** Apply alphanumeric promo codes during checkout for percentage or fixed discounts.                  | **Should** | Version 2.0       |
| **REQ-STU-CATL-08** | **Course Ratings & Reviews:** Read student ratings/reviews on course pages; submit reviews post-course completion.                    | **Should** | Version 2.0       |
| **REQ-STU-CATL-09** | **Download Invoice / Receipt:** Download a formatted PDF payment receipt for completed transactions.                                  | **Should** | Version 2.0       |
| **REQ-STU-CATL-10** | **Wishlist / Bookmark:** Save courses to a personal wishlist for future enrollment.                                                   | **Nice**   | Version 3.0       |
| **REQ-STU-CATL-11** | **Local Payment Gateways:** Pay using regional Jordanian payment rails (CliQ / eFAWATEERcom / Zain Cash).                             | **Nice**   | Version 3.0       |
| **REQ-STU-CATL-12** | **Automated Refund Request:** Submit a refund request within policy limits (e.g., within 14 days and \< 20% course viewed).           | **Nice**   | Version 3.0       |

## **Course Player & Learning Experience**

| Req ID              | Capability & Description                                                                                                              | Priority   | Target Release    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-STU-CATL-01** | **Search & Category Filtering:** Search catalog by keyword, topic category, difficulty level, language, and price.                    | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-CATL-02** | **Course Landing Page:** View course title, description, curriculum outline, instructor bio, and requirements.                        | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-CATL-03** | **Free Public Preview:** Stream designated sample preview lectures without requiring prior course purchase.                           | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-CATL-04** | **Free Course 1-Click Enrollment:** Instantly enroll in free courses with immediate access to curriculum content.                     | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-CATL-05** | **Paid Enrollment via PayPal:** Complete course purchase via PayPal standard checkout with automated enrollment upon payment success. | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-CATL-06** | **Credit Card / Stripe Checkout:** Process payments directly via major credit/debit cards.                                            | **Should** | Version 2.0       |
| **REQ-STU-CATL-07** | **Coupon & Promotion Redemption:** Apply alphanumeric promo codes during checkout for percentage or fixed discounts.                  | **Should** | Version 2.0       |
| **REQ-STU-CATL-08** | **Course Ratings & Reviews:** Read student ratings/reviews on course pages; submit reviews post-course completion.                    | **Should** | Version 2.0       |
| **REQ-STU-CATL-09** | **Download Invoice / Receipt:** Download a formatted PDF payment receipt for completed transactions.                                  | **Should** | Version 2.0       |
| **REQ-STU-CATL-10** | **Wishlist / Bookmark:** Save courses to a personal wishlist for future enrollment.                                                   | **Nice**   | Version 3.0       |
| **REQ-STU-CATL-11** | **Local Payment Gateways:** Pay using regional Jordanian payment rails (CliQ / eFAWATEERcom / Zain Cash).                             | **Nice**   | Version 3.0       |

## **Assignments & Practical Submissions**

| Req ID              | Capability & Description                                                                                             | Priority   | Target Release    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-STU-ASGN-01** | **Assignment Overview:** View assignment briefs, instructions, maximum score, and deadline countdown.                | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-ASGN-02** | **File Upload Submission:** Upload solution files (PDF, DOCX, ZIP) up to 25 MB with submission receipt confirmation. | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-ASGN-03** | **Feedback & Score Viewer:** View assigned grades and instructor commentary/annotated feedback.                      | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-ASGN-04** | **Rich-Text Submissions:** Submit text-based assignments directly using an in-browser rich text editor.              | **Should** | Version 2.0       |
| **REQ-STU-ASGN-05** | **Late Submission Warning:** Submit past deadline with a clear UI banner indicating late penalty policies.           | **Should** | Version 2.0       |
| **REQ-STU-ASGN-06** | **Resubmission Flow:** Submit revised files prior to deadline or upon instructor approval.                           | **Should** | Version 2.0       |

## **Quizzes & Timed Assessments**

| Req ID              | Capability & Description                                                                                                          | Priority   | Target Release    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-STU-EXAM-01** | **Timed Exam Engine:** Take quizzes with a persistent countdown timer that triggers automated submission on expiration.           | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-EXAM-02** | **Objective Question Types:** Answer Multiple Choice (Single/Multi-select), True/False, and Fill-in-the-blank questions.          | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-EXAM-03** | **Question Navigation Grid:** Jump directly to specific question numbers and view answered vs. unanswered status.                 | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-EXAM-04** | **Instant Auto-Grading:** View immediate total score and pass/fail status upon submission for objective quizzes.                  | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-EXAM-05** | **Flag Question for Review:** Mark questions to revisit prior to final submission.                                                | **Should** | Version 2.0       |
| **REQ-STU-EXAM-06** | **Answer Key & Explanation Review:** View correct answers and instructor explanations post-submission (if enabled by instructor). | **Should** | Version 2.0       |
| **REQ-STU-EXAM-07** | **Essay / Free-Text Questions:** Submit long-form written responses subject to manual instructor evaluation.                      | **Should** | Version 2.0       |
| **REQ-STU-EXAM-08** | **Attempt History:** Review past scores across multiple allowed quiz attempts.                                                    | **Should** | Version 2.0       |
| **REQ-STU-EXAM-09** | **Anti-Cheat Tab Detection:** Display warning banners when the browser tab loses focus during an active exam.                     | **Nice**   | Version 3.0       |

## **Grades, Progress & Certificates**

| Req ID              | Capability & Description                                                                                                   | Priority   | Target Release    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-STU-GRAD-01** | **Course Gradebook:** View itemized scores for all quizzes and assignments within an enrolled course.                      | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-GRAD-02** | **Completion Certificate Generation:** Automatically generate and download a PDF certificate upon 100% course completion.  | **Must**   | Version 1.0 (MVP) |
| **REQ-STU-GRAD-03** | **Public Certificate Verification:** Verify certificate authenticity via unique credential ID and public verification URL. | **Should** | Version 2.0       |
| **REQ-STU-GRAD-04** | **Weighted GPA / Average:** View cumulative weighted percentage across all course assessments.                             | **Should** | Version 2.0       |
| **REQ-STU-GRAD-05** | **Printable Academic Transcript:** Generate a consolidated transcript of all completed courses and grades.                 | **Should** | Version 2.0       |
| **REQ-STU-GRAD-06** | **Learning Streaks & Badges:** Track consecutive daily study streaks and earn milestone gamification badges.               | **Nice**   | Version 3.0       |

## **Schedule & Live Sessions**

| Req ID              | Capability & Description                                                                                                      | Priority   | Target Release |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------- |
| **REQ-STU-SCHD-01** | **Live Session & Class Schedule:** View scheduled live sessions with meeting links (Zoom/Google Meet) or classroom locations. | **Should** | Version 2.0    |
| **REQ-STU-SCHD-02** | **Visual Calendar View:** Full monthly and weekly calendar interface aggregating assignment deadlines and scheduled classes.  | **Should** | Version 2.0    |
| **REQ-STU-SCHD-03** | **External Calendar Export:** Export course schedule events to Google Calendar and Apple iCal (.ics format).                  | **Nice**   | Version 3.0    |



# Instructor Software Requirements

**Module Prefix :** REQ-INS  
**User Role :** Instructor (Tier 2\)

## **Authentication, Onboarding & Profile**

| Req ID              | Capability & Description                                                                                                       | Priority   | Target Release    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- | ----------------- |
| **REQ-INS-AUTH-01** | **Admin-Provisioned Account Access:** Log in using credentials provisioned or invited directly by a platform administrator.    | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-AUTH-02** | **Profile & Credentials Management:** Edit bio, profile photo, credentials, teaching specializations, and change password.     | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-AUTH-03** | **Public Instructor Page:** Public-facing profile showcasing instructor bio, specializations, ratings, and published courses.  | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-AUTH-04** | **Public Instructor Application Form:** Submit an "Apply to Teach" application form for administrative vetting and onboarding. | **Should** | Version 2.0       |
| **REQ-INS-AUTH-05** | **Two-Factor Authentication (2FA):** Enforce TOTP-based authentication for instructor portal access.                           | **Nice**   | Version 3.0       |

## **Instructor Dashboard & Schedule**

| Req ID              | Capability & Description                                                                                        | Priority   | Target Release    |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-INS-DASH-01** | **Courses Overview:** View all managed courses, current publishing statuses, and total enrolled student counts. | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-DASH-02** | **Action Items / Grading Queue:** Direct dashboard queue showing pending assignments awaiting manual grading.   | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-DASH-03** | **Upcoming Schedule Planner:** Schedule and manage dates for assignment deadlines and live session links.       | **Should** | Version 2.0       |
| **REQ-INS-DASH-04** | **Unanswered Q\&A Alerts:** Summary widget highlighting unanswered student questions from course discussions.   | **Should** | Version 2.0       |
| **REQ-INS-DASH-05** | **Revenue & Earnings Analytics:** Dashboard tracking total course sales, commission rates, and net earnings.    | **Nice**   | Version 3.0       |

## **Course Creation & Curriculum Builder**

| Req ID              | Capability & Description                                                                                                              | Priority   | Target Release    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-INS-CRSE-01** | **Course Metadata Setup:** Create new course drafts with title, description, category, difficulty level, language, and thumbnail.     | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-CRSE-02** | **Publishing Approval Workflow:** Manage course states: *Draft \-\>  Under Review (submitted to Admin) \-\> Published \-\> Archived*. | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-CRSE-03** | **Curriculum Hierarchy Builder:** Create structured Sections containing ordered Lectures with drag-and-drop reordering.               | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-CRSE-04** | **Archive & Unpublish:** Retire active courses from new enrollments while preserving access for existing students.                    | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-CRSE-05** | **Course Prerequisites:** Define prerequisite courses that students should complete prior to enrolling.                               | **Should** | Version 2.0       |
| **REQ-INS-CRSE-06** | **Enrollment Capacity Limits:** Set maximum student caps to restrict automated enrollment when full.                                  | **Should** | Version 2.0       |
| **REQ-INS-CRSE-07** | **Course Cloning / Duplication:** Duplicate an existing course structure, curriculum, and settings to create a new iteration.         | **Nice**   | Version 3.0       |

## **Lecture Content Management**

| Req ID              | Capability & Description                                                                                                               | Priority   | Target Release    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-INS-CONT-01** | **Video Lecture Upload:** Upload video files with automated transcoding and status tracking.                                           | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-CONT-02** | **Supplementary File Attachments:** Upload downloadable resources (PDFs, PPTX, DOCX, ZIP) attached to specific lectures.               | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-CONT-03** | **Free Public Preview Flag:** Mark selected introductory lectures as free preview lessons accessible without purchase.                 | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-CONT-04** | **Content Replacement / Updating:** Update or replace existing video files and attachments without breaking student progress tracking. | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-CONT-05** | **Rich-Text Articles:** Create text-based and code-snippet lessons using a formatted rich-text editor.                                 | **Should** | Version 2.0       |
| **REQ-INS-CONT-06** | **Subtitle / Captions Upload:** Upload .vtt or .srt subtitle files in Arabic and English for video lectures.                           | **Nice**   | Version 3.0       |

## **Quiz & Timed Exam Builder**

| Req ID              | Capability & Description                                                                                                                       | Priority   | Target Release    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-INS-EXAM-01** | **Assessment Configuration:** Create quizzes with title, duration timer, passing score percentage, and maximum attempts allowed.               | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-EXAM-02** | **Objective Question Authoring:** Add Multiple Choice (single/multi-select), True/False, and Fill-in-the-blank questions with point weighting. | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-EXAM-03** | **Curriculum Attachment:** Embed exams and quizzes at specific milestones within the course section hierarchy.                                 | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-EXAM-04** | **Student View Preview:** Preview and test the interactive exam interface from the student perspective prior to publishing.                    | **Should** | Version 2.0       |
| **REQ-INS-EXAM-05** | **Question Randomization:** Randomize question display order to prevent cheating during cohort assessments.                                    | **Should** | Version 2.0       |
| **REQ-INS-EXAM-06** | **Subjective / Essay Questions:** Add long-form essay questions requiring manual score evaluation and written feedback.                        | **Should** | Version 2.0       |
| **REQ-INS-EXAM-07** | **Central Question Bank:** Maintain a reusable pool of questions categorized by topic for dynamic exam generation.                             | **Should** | Version 2.0       |

## **Assignment Creation & Grading**

| Req ID              | Capability & Description                                                                                                                 | Priority   | Target Release    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-INS-ASGN-01** | **Assignment Authoring:** Create assignments with detailed problem briefs, attached starter files, max scores, and submission deadlines. | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-ASGN-02** | **Submission Evaluation & Feedback:** Review student file submissions, assign numerical grades, and submit written feedback notes.       | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-ASGN-03** | **Submission Policy Enforcement:** Toggle late submission allowances and permit student resubmissions on a per-assignment basis.         | **Should** | Version 2.0       |
| **REQ-INS-ASGN-04** | **Bulk Submission Download:** Download all student assignment files as a consolidated .zip archive for offline grading.                  | **Nice**   | Version 3.0       |

## **Student Tracking, Communication & Analytics**

| Req ID              | Capability & Description                                                                                                        | Priority   | Target Release    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-INS-DATA-01** | **Enrolled Student Directory:** View class rosters and monitor individual student progress (lectures completed, grades earned). | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-DATA-02** | **Course Broadcast Announcements:** Publish text announcements pushed to all enrolled students via dashboard feeds.             | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-DATA-03** | **Course Completion Analytics:** Track high-level metrics: enrollment counts, completion rates, and average quiz scores.        | **Must**   | Version 1.0 (MVP) |
| **REQ-INS-DATA-04** | **Manual Enrollment Management:** Manually enroll or revoke student access to a specific course.                                | **Should** | Version 2.0       |
| **REQ-INS-DATA-05** | **Roster CSV Export:** Export student rosters, contact details, and performance grades to CSV.                                  | **Should** | Version 2.0       |
| **REQ-INS-DATA-06** | **Discussion Thread Moderation:** Respond to student inquiries and moderate questions on per-lecture discussion boards.         | **Should** | Version 2.0       |
| **REQ-INS-DATA-07** | **Lecture Engagement Drop-Off:** Visualize video watch times and drop-off analytics per lecture to optimize course quality.     | **Should** | Version 2.0       |
| **REQ-INS-DATA-08** | **Direct Messaging: Send direct private messages to individual enrolled students.**                                             | **Nice**   | Version 3.0       |



# Admin Software Requirements

**Module Prefix :** REQ-ADM  
**User Role :** Admin (Tier 1\)

## **User Management & Access Control (RBAC)**

| Req ID              | Capability & Description                                                                                                         | Priority   | Target Release    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-ADM-USER-01** | **User Directory & CRUD:** View, filter, create, edit, suspend, and delete student, instructor, and admin accounts.              | **Must**   | Version 1.0 (MVP) |
| **REQ-ADM-USER-02** | **Role Assignment & RBAC:** Enforce and reassign system roles (Student, Instructor, Admin) with granular permission boundaries.  | **Must**   | Version 1.0 (MVP) |
| **REQ-ADM-USER-03** | **Bulk Student Onboarding:** Import batches of students via CSV files with automated account provisioning and course enrollment. | **Should** | Version 2.0       |

## **Course Quality Governance & Taxonomy**

| Req ID              | Capability & Description                                                                                                                              | Priority | Target Release    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------- |
| **REQ-ADM-CRSE-01** | **Course Review & Approval Workflow:** Review submitted courses (Under Review), approve for public release, or reject with structured feedback notes. | **Must** | Version 1.0 (MVP) |
| **REQ-ADM-CRSE-02** | **Category & Metadata Taxonomy:** Create, edit, and organize course categories, subcategories, language tags, and difficulty levels.                  | **Must** | Version 1.0 (MVP) |
| **REQ-ADM-CRSE-03** | **Global Course Override:** Force-unpublish, edit, or archive any course violating platform guidelines or academic standards.                         | **Must** | Version 1.0 (MVP) |

## 

## **Platform Analytics & Financial Oversight**

| Req ID              | Capability & Description                                                                                                                      | Priority   | Target Release    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| **REQ-ADM-DATA-01** | **Platform Metrics Overview:** High-level dashboard displaying total active users, new enrollments, published courses, and platform activity. | **Must**   | Version 1.0 (MVP) |
| **REQ-ADM-DATA-02** | **Revenue & Transaction Reports:** Track gross transaction volume, refund logs, payment gateway processing fees, and sales trends.            | **Should** | Version 2.0       |
| **REQ-ADM-DATA-03** | **Instructor Payout Settlements:** Calculate instructor revenue-share splits and generate monthly payout balance sheets.                      | **Nice**   | Version 3.0       |

## 

## **Platform Settings, Promotions & Communications**

| Req ID              | Capability & Description                                                                                                                       | Priority   | Target Release |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------- |
| **REQ-ADM-CONF-01** | **Global System Settings:** Configure platform branding (logo, favicon), default language, timezone, and support contact details.              | **Should** | Version 2.0    |
| **REQ-ADM-CONF-02** | **Coupons & Promotional Campaigns:** Generate and manage percentage/fixed discount codes, set expiration dates, and enforce redemption limits. | **Should** | Version 2.0    |
| **REQ-ADM-CONF-03** | **Notification & Email Templates:** Customize system email templates for welcome sequences, password resets, receipts, and announcements.      | **Should** | Version 2.0    |

## 

## **Security, Content Moderation & Maintenance**

| Req ID              | Capability & Description                                                                                                                 | Priority   | Target Release |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------- |
| **REQ-ADM-SECU-01** | **System Audit Logs:** Append-only log recording administrative actions, role changes, course status changes, and login attempts.        | **Should** | Version 2.0    |
| **REQ-ADM-SECU-02** | **Content Moderation Desk:** Review flagged course reviews, discussion comments, or reported materials and remove non-compliant content. | **Should** | Version 2.0    |
| **REQ-ADM-SECU-03** | **System Backup & Data Export:** Trigger on-demand database snapshots and export platform transaction records to encrypted archives.     | **Should** | Version 2.0    |

## 