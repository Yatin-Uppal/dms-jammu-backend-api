exports.auth_api = ["/api/login"];

exports.backup_api = ["/api/backup"];

exports.dashboard_api = ["/api/dashboard_list_view/:date_range?/:fmn_id?"];

exports.download_reports_api = ["/api/download_excel", "/api/download_amk"];

exports.manage_formation_api = [
  "/api/formation/save",
  "/api/formation-list",
  "/api/formation-complete-list",
  "/api/formation",
  "/api/formation",
];

exports.manage_lts_api = [
  "/api/import-data",
  "/api/lts",
  "/api/lts-details",
  "/api/lts/:ltsId/details",
  "/api/lts/:lts_Id",
  "/api/lts/:ltsId",
  "/api/lts/details",
];

exports.manage_users_api = [
  "/api/user",
  "/api/user/:user_id",
  "/api/user-list",
];

exports.manage_vehicle_api = [
  "/api/assign-lts",
  "/api/assign-lts/:id",
  "/api/assign-lts/load",
  "/api/driver-vehicle/store",
  "/api/driver-list",
  "/api/driver-vehicle",
  "/api/drivers-without-lts",
  "/api/driver-details",
  "/api/driver-vehicle-details",
  "/api/soft-delete-driver",
  "/api/vehicle/list/series",
];

exports.mobile_control_api = [
  "/api/driver_list_not_loaded",
  "/api/sync-driver-data",
];
exports.mobile_gate_checkout_api = [
  "/api/gate-checkout",
  "/api/mobile_dashboard_list_view/:date_range?/:series?",
  "/api/driver-chcekout",
];

exports.track_loading_api = [
  "/api/record_details/:record_id",
  "/api/record_details",
  "/api/record_details_series/:series?",
];

exports.manage_amk_quantity_api = [
  "/api/manage_amk_quantity/store",
  "/api/manage_amk_quantity/update",
  "/api/manage_amk_quantity/delete",
]

exports.manage_amk_quantity_import_file_api = [
  "/api/manage_amk_quantity/import-data-new"
]

exports.manage_series = [
  "/api/manage_series/store",
  "/api/manage_series/update",
  "/api/manage_series/series",
  "/api/manage_series/series_batch"
]

exports.manage_qr_codes_api = [
  "/api/lot-qr-details/generate-lot-qr",
  "/api/lot-qr-details/update-lot-qr",
  "/api/delete-lots-qr-details"
]