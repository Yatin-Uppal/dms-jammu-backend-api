exports.loginModuleAction = (username) => [
  {
    http_method: "POST",
    status: 400,
    action_performed: `Login attempt by ${username}.`,
    message: `Login attempt by ${username} failed due to invalid data.`,
  },
  {
    http_method: "POST",
    status: 404,
    action_performed: `Login attempt by ${username}.`,
    message: "Error: Invalid credentials",
  },
  {
    http_method: "POST",
    status: 401,
    action_performed: `Login attempt by ${username}.`,
    message: "Error: Access Denied. Please contact DCC Admin for assistance.",
  },
  {
    http_method: "POST",
    status: 200,
    action_performed: `Login attempt by ${username}.`,
    message: `${username} successfully logged in.`,
  },
  {
    http_method: "POST",
    status: 500,
    action_performed: `Login attempt by ${username}.`,
    message: "Server Error. Please try again later.",
  },
];

exports.manageSeriesAction = (username) => [
  {
    http_method: "POST",
    status: 200,
    action_performed: `${username} attempted to create a series.`,
    message: `${username} successfully created a series.`,
  },
  {
    http_method: "POST",
    status: 400,
    action_performed: `${username} attempted to create a series.`,
    message: `${username} provided invalid data for creating a series.`,
  },
  {
    http_method: "POST",
    status: 500,
    action_performed: `${username} attempted to create a series.`,
    message: "An unexpected server error occurred.",
  },
  {
    http_method: "POST",
    status: 403,
    action_performed: `${username} attempted to create a series.`,
    message: "Access Denied. Please contact DCC Admin for assistance.",
  },
  {
    http_method: "PATCH",
    status: 200,
    action_performed: `${username} attempted to update a series.`,
    message: `${username} successfully updated a series.`,
  },
  {
    http_method: "PATCH",
    status: 400,
    action_performed: `${username} attempted to update a series.`,
    message: `${username} provided invalid data for creating a series.`,
  },
  {
    http_method: "PATCH",
    status: 500,
    action_performed: `${username} attempted to update a series.`,
    message: "An unexpected server error occurred.",
  },
  {
    http_method: "PATCH",
    status: 403,
    action_performed: `${username} attempted to update a series.`,
    message: "Access Denied. Please contact DCC Admin for assistance.",
  },
];

exports.backupModuleAction = (username) => [
  {
    http_method: "POST",
    status: 200,
    action_performed: `${username} initiated a database file backup.`,
    message: `${username}'s database file backup was successful.`,
  },
  {
    http_method: "POST",
    status: 500,
    action_performed: `${username} attempted a database file backup.`,
    message: `An unexpected server error occurred during the backup process.`,
  },
];

exports.formationModuleAction = (username, formationData) => [
  {
    http_method: "POST",
    status: 400,
    action_performed: `${username} attempted to create a formation.`,
    message: `${username} provided invalid data for creating a formation.`,
  },
  {
    http_method: "POST",
    status: 200,
    action_performed: `${username} attempted to create a formation.`,
    message: `${username} successfully created a formation.`,
  },
  {
    http_method: "POST",
    status: 403,
    action_performed: `${username} attempted to create a formation.`,
    message: `${username} attempted to add a formation, but it already exists.`,
  },
  {
    http_method: "POST",
    status: 500,
    action_performed: `${username} attempted to create a formation.`,
    message: `${username} encountered a server error while trying to create a formation.`,
  },
  {
    http_method: "PUT",
    status: 400,
    action_performed: `${username} attempted to update a formation.`,
    message: `${username} provided invalid data for updating a formation.`,
  },
  {
    http_method: "PUT",
    status: 403,
    action_performed: `${username} attempted to update the formation "${formationData}".`,
    message: `The formation name already exists. Please use a different formation name.`,
  },
  {
    http_method: "PUT",
    status: 200,
    action_performed: `${username} attempted to update the formation "${formationData}".`,
    message: `${username} successfully updated a formation.`,
  },
  {
    http_method: "PUT",
    status: 500,
    action_performed: `${username} attempted to update the formation "${formationData}".`,
    message: `${username} encountered a server error while trying to update a formation.`,
  },
  {
    http_method: "DELETE",
    status: 400,
    action_performed: `${username} attempted to delete the formation "${formationData}".`,
    message: `The formation does not exist.`,
  },
  {
    http_method: "DELETE",
    status: 403,
    action_performed: `${username} attempted to delete the formation "${formationData}".`,
    message: `The assigned formation cannot be deleted.`,
  },
  {
    http_method: "DELETE",
    status: 200,
    action_performed: `${username} attempted to delete the formation "${formationData}".`,
    message: `Formation deleted successfully.`,
  },
  {
    http_method: "DELETE",
    status: 500,
    action_performed: `${username} attempted to delete the formation "${formationData}".`,
    message: `${username} encountered a server error while trying to delete a formation.`,
  },
];

exports.ltsModuleAction = (username, ltsData) => [
  ...(ltsData ? [{
    http_method: "POST",
    status: 400,
    action_performed: `${username} attempted to import driver data via an Excel file.`,
    message: `${username} provided invalid data in the Excel file.`,
  },
  {
    http_method: "POST",
    status: 200,
    action_performed: `${username} attempted to import driver data via an Excel file.`,
    message: `${username} successfully imported the data.`,
  },
  {
    http_method: "POST",
    status: 500,
    action_performed: `${username} attempted to import driver data via an Excel file.`,
    message: `${username} encountered a server error.`,
  }] : []),
  {
    http_method: "POST",
    status: 400,
    action_performed: `${username} attempted to create an LTS.`,
    message: `${username} added incorrect details for the LTS.`,
  },
  {
    http_method: "POST",
    status: 403,
    action_performed: `${username} attempted to create an LTS.`,
    message: `${username} added an LTS with a name that already exists in the database.`,
  },
  {
    http_method: "POST",
    status: 200,
    action_performed: `${username} attempted to create an LTS.`,
    message: `${username} successfully created the LTS.`,
  },
  {
    http_method: "PUT",
    status: 400,
    action_performed: `${username} attempted to update the LTS "${ltsData}".`,
    message: `${username} provided invalid data to update "${ltsData}".`,
  },
  {
    http_method: "PUT",
    status: 403,
    action_performed: `${username} attempted to update the LTS "${ltsData}".`,
    message: `${username} tried to update "${ltsData}" but it already exists in the database.`,
  },
  {
    http_method: "PUT",
    status: 200,
    action_performed: `${username} attempted to update the LTS "${ltsData}".`,
    message: `${username} successfully updated the data for "${ltsData}".`,
  },
  {
    http_method: "PUT",
    status: 500,
    action_performed: `${username} attempted to update the LTS "${ltsData}".`,
    message: `${username} faced an internal server error while updating "${ltsData}".`,
  },
  {
    http_method: "DELETE",
    status: 400,
    action_performed: `${username} attempted to delete the LTS "${ltsData}".`,
    message: `${username} tried to delete "${ltsData}" but it does not exist.`,
  },
  {
    http_method: "DELETE",
    status: 404,
    action_performed: `${username} attempted to delete the LTS "${ltsData}".`,
    message: `${username} tried to delete "${ltsData}" but it is assigned to some driver.`,
  },
  {
    http_method: "DELETE",
    status: 200,
    action_performed: `${username} attempted to delete the LTS "${ltsData}".`,
    message: `${username} successfully deleted "${ltsData}".`,
  },
  {
    http_method: "DELETE",
    status: 500,
    action_performed: `${username} attempted to delete the LTS "${ltsData}".`,
    message: `${username} faced an internal server error while deleting "${ltsData}".`,
  },
];

exports.userModuleAction = (username, userData) => [
  {
    http_method: "POST",
    status: 400,
    action_performed: `${username} attempted to create a new user.`,
    message: `${username} provided invalid data for the new user.`,
  },
  {
    http_method: "POST",
    status: 200,
    action_performed: `${username} attempted to create a new user.`,
    message: `${username} successfully created the new user.`,
  },
  {
    http_method: "POST",
    status: 500,
    action_performed: `${username} attempted to create a new user.`,
    message: `${username} faced an internal server error while creating a new user.`,
  },
  {
    http_method: "PUT",
    status: 400,
    action_performed: `${username} attempted to update ${userData}.`,
    message: `${username} provided invalid data for updating ${userData}.`,
  },
  {
    http_method: "PUT",
    status: 404,
    action_performed: `${username} attempted to update ${userData}.`,
    message: `${username} attempted to update ${userData}, but it already exists in the database.`,
  },
  {
    http_method: "PUT",
    status: 200,
    action_performed: `${username} attempted to update ${userData}.`,
    message: `${username} successfully updated ${userData}.`,
  },
  {
    http_method: "PUT",
    status: 500,
    action_performed: `${username} attempted to update ${userData}.`,
    message: `${username} faced an internal server error while updating ${userData}.`,
  },
  {
    http_method: "DELETE",
    status: 400,
    action_performed: `${username} attempted to delete ${userData}.`,
    message: `${username} provided incorrect data for deleting ${userData}.`,
  },
  {
    http_method: "DELETE",
    status: 200,
    action_performed: `${username} attempted to delete ${userData}.`,
    message: `${username} successfully deleted ${userData}.`,
  },
  {
    http_method: "DELETE",
    status: 500,
    action_performed: `${username} attempted to delete ${userData}.`,
    message: `${username} faced an internal server error while deleting ${userData}.`,
  },
];

exports.driverModuleAction = (username) => [
  {
    http_method: "POST",
    api_url: "/api/assign-lts",
    status: 400,
    action_performed: `${username} attempted to assign an LTS to a vehicle.`,
    message: `${username} provided invalid data for assigning LTS to vehicle.`,
  },
  {
    http_method: "POST",
    api_url: "/api/assign-lts",
    status: 200,
    action_performed: `${username} attempted to assign an LTS to a vehicle.`,
    message: `${username} successfully assigned LTS to vehicle.`,
  },
  {
    http_method: "POST",
    api_url: "/api/assign-lts",
    status: 500,
    action_performed: `${username} attempted to assign an LTS to a vehicle.`,
    message: `${username} faced an internal server error while assigning LTS to vehicle.`,
  },
  {
    http_method: "DELETE",
    api_url: "/api/assign-lts",
    status: 404,
    action_performed: `${username} attempted to delete the assigned LTS to a vehicle.`,
    message: `${username} faced an error while deleting the assigned LTS.`,
  },
  {
    http_method: "DELETE",
    api_url: "/api/assign-lts",
    status: 400,
    action_performed: `${username} attempted to delete the assigned LTS to a vehicle.`,
    message: `${username} faced an error while deleting the assigned LTS to vehicle.`,
  },
  {
    http_method: "DELETE",
    api_url: "/api/assign-lts",
    status: 200,
    action_performed: `${username} attempted to delete the assigned LTS to a vehicle.`,
    message: `${username} successfully deleted the assigned LTS to vehicle.`,
  },
  {
    http_method: "DELETE",
    api_url: "/api/assign-lts",
    status: 500,
    action_performed: `${username} attempted to delete the assigned LTS to a vehicle.`,
    message: `${username} faced an internal server error while deleting the assigned LTS.`,
  },
  {
    http_method: "PUT",
    api_url: "/api/assign-lts/load",
    status: 400,
    action_performed: `${username} attempted to update the assigned LTS to a vehicle.`,
    message: `${username} faced an error while changing the assigned LTS for vehicle.`,
  },
  {
    http_method: "PUT",
    api_url: "/api/assign-lts/load",
    status: 200,
    action_performed: `${username} attempted to update the assigned LTS to a vehicle.`,
    message: `${username} successfully reassigned LTS to vehicle.`,
  },
  {
    http_method: "PUT",
    api_url: "/api/assign-lts/load",
    status: 500,
    action_performed: `${username} attempted to update the assigned LTS to a vehicle.`,
    message: `${username} faced an internal server error while reassigned LTS to vehicle.`,
  },
  {
    http_method: "POST",
    api_url: "/api/driver-vehicle/store",
    status: 400,
    action_performed: `${username} attempted to store new vehicle details.`,
    message: `${username} provided invalid data while adding new vehicle details.`,
  },
  {
    http_method: "POST",
    api_url: "/api/driver-vehicle/store",
    status: 200,
    action_performed: `${username} attempted to store new vehicle details.`,
    message: `${username} successfully added new vehicle details.`,
  },
  {
    http_method: "POST",
    api_url: "/api/driver-vehicle/store",
    status: 500,
    action_performed: `${username} attempted to store new vehicle details.`,
    message: `${username} faced an internal server error while adding new vehicle details.`,
  },
  {
    http_method: "PUT",
    api_url: "/api/driver-vehicle",
    status: 400,
    action_performed: `${username} attempted to update vehicle details for.`,
    message: `${username} provided invalid data to update vehicle details for.`,
  },
  {
    http_method: "PUT",
    api_url: "/api/driver-vehicle",
    status: 404,
    action_performed: `${username} attempted to update vehicle details for.`,
    message: `${username} could not find the record for vehicle.`,
  },
  {
    http_method: "PUT",
    api_url: "/api/driver-vehicle",
    status: 200,
    action_performed: `${username} attempted to update vehicle details for.`,
    message: `${username} successfully updated vehicle details for.`,
  },
  {
    http_method: "PUT",
    api_url: "/api/driver-vehicle",
    status: 500,
    action_performed: `${username} attempted to update vehicle details for.`,
    message: `${username} faced an internal server error while updating vehicle details for.`,
  },
  {
    http_method: "DELETE",
    api_url: "/api/soft-delete-driver",
    status: 200,
    action_performed: `${username} attempted to delete vehicle details for.`,
    message: `${username} successfully deleted vehicle details for.`,
  },
  {
    http_method: "DELETE",
    api_url: "/api/soft-delete-driver",
    status: 500,
    action_performed: `${username} attempted to delete vehicle details for.`,
    message: `${username} faced an internal server error while deleting vehicle details for.`,
  },
];

exports.mobileControlCenterModuleAction = (username) => [
  {
    http_method: "POST",
    status: 200,
    action_performed: `${username} synchronized vehicle data via mobile phone from the control center.`,
    message: `${username} successfully synchronized data from the control center.`,
  },
  {
    http_method: "POST",
    status: 500,
    action_performed: `${username} synchronized vehicle data via mobile phone from the control center.`,
    message: `${username} faced an internal server error while synchronizing data from the control center.`,
  },
];

exports.mobileGateCheckoutModuleAction = (username) => [
  {
    http_method: "PUT",
    status: 404,
    action_performed: `${username} attempted to checkout the vehicle via mobile phone.`,
    message: `${username} could not find vehicle details for checkout via mobile phone.`,
  },
  {
    http_method: "PUT",
    status: 200,
    action_performed: `${username} attempted to checkout the vehicle via mobile phone.`,
    message: `${username} successfully checked out the vehicle via mobile phone.`,
  },
  {
    http_method: "PUT",
    status: 500,
    action_performed: `${username} attempted to checkout the vehicle via mobile phone.`,
    message: `${username} faced an internal server error while checking out the vehicle via mobile phone.`,
  },
  {
    http_method: "POST",
    status: 400,
    action_performed: `${username} attempted to checkout bulk vehicle data via mobile phone.`,
    message: `${username} could not find vehicle details for bulk checkout via mobile phone.`,
  },
  {
    http_method: "POST",
    status: 200,
    action_performed: `${username} attempted to checkout bulk vehicle data via mobile phone.`,
    message: `${username} successfully checked out vehicles via mobile phone.`,
  },
  {
    http_method: "POST",
    status: 500,
    action_performed: `${username} attempted to checkout bulk vehicle data via mobile phone.`,
    message: `${username} faced an internal server error while checking out vehicles via mobile phone.`,
  },
];

exports.manageAmkQuantity = (username, manageAmkQuantityData) => [
  {
    http_method: "POST",
    status: 400,
    action_performed: `${username} attempted to store AMK quantity data.`,
    message: `Failed to store ${username}'s AMK quantity data due to incorrect input.`,
  },
  {
    http_method: "POST",
    status: 200,
    action_performed: `${username} attempted to store AMK quantity data.`,
    message: `Successfully stored ${username}'s AMK quantity data.`,
  },
  {
    http_method: "POST",
    status: 500,
    action_performed: `${username} attempted to store AMK quantity data.`,
    message: `Encountered an internal server error while attempting to store ${username}'s AMK quantity data.`,
  },
  {
    http_method: "PUT",
    status: 400,
    action_performed: `${username} attempted to update AMK quantity data.`,
    message: `Failed to update ${username}'s AMK quantity data. Incorrect data entered during the update for AMK number ${manageAmkQuantityData?.amk_number}.`,
  },
  {
    http_method: "PUT",
    status: 404,
    action_performed: `${username} attempted to update AMK quantity data.`,
    message: `${username} did not find any data to update.`,
  },
  {
    http_method: "PUT",
    status: 200,
    action_performed: `${username} attempted to update AMK quantity data.`,
    message: `Successfully updated ${username}'s AMK quantity data. AMK number ${manageAmkQuantityData?.amk_number} now has a quantity of ${manageAmkQuantityData?.total_quantity}, and the location is ${manageAmkQuantityData?.location_33_fad}.`,
  },
  {
    http_method: "PUT",
    status: 500,
    action_performed: `${username} attempted to update AMK quantity data.`,
    message: `Encountered an internal server error while attempting to update ${username}'s AMK quantity data for AMK number ${manageAmkQuantityData?.amk_number}.`,
  },
  {
    http_method: "DELETE",
    status: 400,
    action_performed: `${username} attempted to delete AMK quantity data.`,
    message: `Failed to delete ${username}'s AMK quantity data. Incorrect ID entered during the deletion for AMK number ${manageAmkQuantityData?.amk_number}.`,
},
{
    http_method: "DELETE",
    status: 200,
    action_performed: `${username} attempted to delete AMK quantity data.`,
    message: `Successfully deleted ${username}'s AMK quantity data for AMK number ${manageAmkQuantityData?.amk_number}.`,
},
{
    http_method: "DELETE",
    status: 500,
    action_performed: `${username} attempted to delete AMK quantity data.`,
    message: `Encountered an internal server error while attempting to delete ${username}'s AMK quantity data for AMK number ${manageAmkQuantityData?.amk_number}.`,
}

];

exports.manageAmkQuantityImportDataAction = (username) => [
  {
    http_method: "POST",
    status: 400,
    action_performed: `${username} attempted to import AMK quantity data via an Excel file.`,
    message: `Failed to import data for ${username}'s AMK quantity. Incorrect input in the Excel file.`,
  },
  {
    http_method: "POST",
    status: 200,
    action_performed: `${username} attempted to import AMK quantity data via an Excel file.`,
    message: `Successfully imported and stored ${username}'s AMK quantity data using an Excel file.`,
  },
  {
    http_method: "POST",
    status: 500,
    action_performed: `${username} attempted to import AMK quantity data via an Excel file.`,
    message: `Encountered an internal server error while attempting to store ${username}'s AMK quantity data via an Excel file.`,
  },
];
