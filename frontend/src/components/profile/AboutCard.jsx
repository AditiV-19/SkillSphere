export default function AboutCard({profileData, setProfileData, isEditing}) {

    return (

        <div className="bg-white rounded-3xl shadow-sm p-8">

            <h2 className="text-xl font-bold mb-4">

                About Me

            </h2>

           {
isEditing ?

(

<textarea

className="w-full border rounded-xl p-4"

value={profileData.about}

onChange={(e)=>

setProfileData({

...profileData,

about:e.target.value

})

}

/>

)

:

(

<p>

{profileData.about ||

"Tell clients about yourself."}

</p>

)
}

        </div>

    );

}