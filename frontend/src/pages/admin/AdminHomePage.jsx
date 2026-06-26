import Navbar from "../layouts/NavBar";


function AdminHomePage() {
  return (
    <div className="mt-25">
      <Navbar />
      <h1 className="text-4xl font-bold">Hello Admin!</h1>
      <div>
        <div className="min-h-screen w-1/2 bg-gray-100">
            <div className="h-80 w-150 bg-gray-500">
                <h1>Admin Dashboard</h1>
            </div>
        </div>
        <div className="min-h-screen w-1/2 bg-red-100">
            <div className="h-80 w-150 bg-red-500">
                <h1>Users</h1>
            </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHomePage
