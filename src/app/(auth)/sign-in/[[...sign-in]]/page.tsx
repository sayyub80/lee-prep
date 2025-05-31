import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='w-full py-12 flex justify-center items-center h-full'>
            <SignIn/>
        </div>
  )
}