export default function Settings() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h2>

      <div className="bg-white dark:bg-stone-800 rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Import/Export Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Import / Export
            </h3>
            {/* Import/Export buttons will go here */}
          </div>

          {/* Clear Data Section */}
            <div className="pt-6 border-t border-gray-200 dark:border-stone-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Data Management
            </h3>
            {/* Clear data button will go here */}
          </div>
        </div>
      </div>
    </div>
  )
}
